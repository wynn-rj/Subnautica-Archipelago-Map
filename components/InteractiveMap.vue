<script lang="ts" setup>
import type { LatLngBoundsExpression, Marker, Icon, IconOptions } from 'leaflet'

const { height, width } = useWindowSize();
const locationMarkers = shallowReactive<Map<number, Marker | undefined>>(
  new Map()
);

type IconMap = {
  green: Icon<IconOptions>
  orange: Icon<IconOptions>
  red: Icon<IconOptions>
  done: Icon<IconOptions>
}
const iconMap = shallowRef<IconMap>()

const archipelago = useArchipelagoStore();

function getIcon(location: CheckLocation, icons: IconMap) {
  if (!archipelago.reachableLocations.has(location.id)) return icons.red;
  return location.far && !archipelago.completedItems.has(ItemIDs.Seaglide)
    ? icons.orange
    : icons.green;
}

function updateIcons() {
  console.log("Checked: ", archipelago.checkedLocations);
  console.log("Have: ", archipelago.completedItems);
  const icons = iconMap.value
  LOCATIONS.forEach((loc) => {
    const marker = locationMarkers.get(loc.id);
    if (!marker) return;
    if (!archipelago.checkedLocations.includes(loc.id) && icons) {
      marker.setIcon(getIcon(loc, icons));
      return;
    }
    console.log("Disabling: ", loc.name, marker.getIcon());
    marker.remove();
    locationMarkers.set(loc.id, undefined);
  });
}

watch(
  [
    () => archipelago.connected,
    () => archipelago.checkedLocations,
    () => archipelago.reachableLocations,
    () => archipelago.completedItems,
    () => archipelago.maxDepth,
  ],
  (connected) => {
    if (connected) updateIcons();
  }
);

onMounted(async () => {
  const {
    CRS,
    control,
    icon,
    imageOverlay,
    map,
    marker,
  } = await import("leaflet");

  const icons = ["green", "orange", "red", "done"].map((color) => {
    return icon({
      iconUrl: `marker-${color}.png`,
      shadowUrl: "marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
  });
  iconMap.value = {
    green: icons[0]!,
    orange: icons[1]!,
    red: icons[2]!,
    done: icons[3]!,
  }

  const interactiveMap = map("interactive-map", {
    crs: CRS.Simple,
    minZoom: -3,
    zoomControl: false,
    attributionControl: false,
  });
  control.zoom({ position: "bottomright" }).addTo(interactiveMap);
  const bounds = [
    [-2100, -2100],
    [2100, 2100],
  ] as LatLngBoundsExpression;
  imageOverlay("textured.png", bounds).addTo(interactiveMap);
  interactiveMap.fitBounds(bounds);

  LOCATIONS.forEach((loc) => {
    const requiredItems = [...loc.needed_items]
      .map((id) => `<li>${ITEMS[id]?.name ?? "Unknown"}</li>`)
      .join("");
    const cur = marker([loc.position.z, loc.position.x])
      .bindTooltip(loc.name)
      .bindPopup(
        `<div class="text-white">
          <h3>${loc.name}</h3>
          <hr class="my-1" />
          <div class="flex">
            <strong class="pr-1">Coordinates:</strong> <pre>${loc.position.x} ${
          loc.position.y
        } ${loc.position.z}</pre>
          </div>
          <div style="display: ${!requiredItems ? "flex" : "block"}">
            <strong class="pr-1">Required Items:</strong>
            ${
              requiredItems
                ? '<ul class="list-disc ml-3">' + requiredItems + "</ul>"
                : "None"
            }
          </div>
        </div>`
      )
      .addTo(interactiveMap);
    locationMarkers.set(loc.id, cur);
  });
});
</script>

<template>
  <div
    id="interactive-map"
    :style="{ width: `${width}px`, height: `${height}px` }"
  />
</template>

<style lang="css">
@import "leaflet/dist/leaflet.css";

.leaflet-popup-content-wrapper,
.leaflet-popup-tip,
.leaflet-tooltip {
  background-color: rgb(30, 41, 59);
  border-color: rgb(75, 85, 99);
}

.leaflet-tooltip-right::before {
  border-right-color: rgb(30, 41, 59);
}

.leaflet-tooltip-left::before {
  border-left-color: rgb(30, 41, 59);
}

.leaflet-popup-content-wrapper {
  border-width: 1px;
  border-radius: 0.5rem;
  border-style: solid;
}

.leaflet-tooltip {
  color: white;
}
</style>

<style lang="scss">
#interactive-map {
  position: absolute;
  top: 0px;
  left: 0px;
  background-color: black;
}
</style>
