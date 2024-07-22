import { Client, itemsHandlingFlags } from "archipelago.js";
import { defineStore } from "pinia";
import { ITEMS, ItemIDs } from "../utils/items";

function itemDepth(items: Set<number>) {
  if (items.has(ItemIDs.Seaglide))
    return items.has(ItemIDs.UltraCapaciyTank) ? 350 : 200;
  if (!items.has(ItemIDs.ModStation)) return 0;

  let depth = 0;
  if (items.has(ItemIDs.UltraCapaciyTank)) depth += 100;
  if (items.has(ItemIDs.LightCapacityTank)) depth += 25;
  if (items.has(ItemIDs.UltraGlideFins)) depth += 50;
  return depth;
}

function has_vehicle_upgrade(items: Set<number>) {
  return items.has(ItemIDs.VehicleUpgrade) && items.has(ItemIDs.Moonpool);
}

function cyclopsDepth(items: Set<number>) {
  if (
    !items.has(ItemIDs.VehicleBay) ||
    !items.has(ItemIDs.CyclopsBridge) ||
    !items.has(ItemIDs.CyclopsEngine) ||
    !items.has(ItemIDs.CyclopsHull)
  )
    return 0;
  if (!items.has(ItemIDs.CyclopsDepth)) return 500;
  if (!items.has(ItemIDs.ModStation)) return 900;
  return 1700;
}

function prawnDepth(items: Set<number>) {
  if (!items.has(ItemIDs.VehicleBay)) return 0;
  if (!items.has(ItemIDs.Prawn)) return 0;
  if (!has_vehicle_upgrade(items)) return 900;
  if (!items.has(ItemIDs.ModStation)) return 1300;
  return 1700;
}

function seamothDepth(items: Set<number>) {
  if (!items.has(ItemIDs.VehicleBay)) return 0;
  if (!items.has(ItemIDs.Seamoth)) return 0;
  if (!has_vehicle_upgrade(items)) return 200;
  if (!items.has(ItemIDs.ModStation)) return 300;
  return 900;
}

function calcMaxDepth(
  items: Set<number>,
  baseDepth: number,
  includeItems: boolean
) {
  let depth = baseDepth;
  if (includeItems) depth += itemDepth(items);
  depth += Math.max(
    seamothDepth(items),
    prawnDepth(items),
    cyclopsDepth(items)
  );
  return depth;
}

type ItemMap = Map<number, { current: number; total: number }>;
export const useArchipelagoStore = defineStore("archipelago", () => {
  const clientRef = shallowRef<Client>(new Client());
  const items = shallowRef<ItemMap>(new Map());
  const canHint = shallowRef(false);
  const checkedLocations = shallowRef<number[]>([]);
  const connected = shallowRef(false);
  const baseDepth = shallowRef(200);
  const includeItems = shallowRef(false);
  const maxDepth = useLocalStorage("archipelago-server-depth", 200);

  const completedItems = computed(() => {
    const completed: number[] = [];
    items.value.forEach(({ current, total }, key) => {
      if (current >= total) completed.push(key);
    });
    return new Set(completed);
  });
  const reachableLocations = computed(() => {
    const itemSet = toValue(completedItems.value);
    const maxDepthVal = calcMaxDepth(
      itemSet,
      baseDepth.value,
      includeItems.value
    );
    maxDepth.value = maxDepthVal;
    return new Set(
      LOCATIONS.filter((loc) => {
        return (
          subsetOf(loc.needed_items, itemSet) && loc.position.y >= -maxDepthVal
        );
      }).map(({ id }) => id)
    );
  });

  function updateState() {
    const client = clientRef.value;
    canHint.value = client.room.hintPoints > client.room.hintCost;
    checkedLocations.value = [...client.room.checkedLocations];
    const swimRule = "easy"; //(client..swim_rule ?? "easy").toString();
    baseDepth.value = swimRule.includes("easy")
      ? 200
      : swimRule.includes("normal")
      ? 400
      : 600;
    includeItems.value = swimRule.includes("items");
  }

  watch(
    clientRef,
    () => {
      const client = clientRef.value;
      client.messages.on("connected", () => nextTick(updateState));
      client.messages.on("collected", () => nextTick(updateState));

      client.messages.on("itemSent", () => {
        nextTick(() => {
          items.value = client.items.received
            .filter((item) => item.id in ITEMS)
            .reduce((map, cur) => {
              map.set(cur.id, {
                current: (map.get(cur.id)?.current ?? 0) + 1,
                total: ITEMS[cur.id].count,
              });
              return map;
            }, new Map() as ItemMap);
        });
      });
    },
    { immediate: true }
  );

  async function connect(host: string, port: number, name: string) {
    return clientRef.value
      .login(`wss://${host}:${port}`, name, "Subnautica", {
        items: itemsHandlingFlags.all,
        tags: ["Tracker"],
      })
      .then(() => {
        connected.value = true;
      });
  }

  return {
    client: clientRef,
    connect,
    connected,
    items,
    reachableLocations,
    checkedLocations,
    completedItems,
    maxDepth,
  };
});
