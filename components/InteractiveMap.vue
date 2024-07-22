<script lang="ts" setup>
import {
  CRS,
  control,
  icon,
  imageOverlay,
  map,
  marker,
  type LatLngBoundsExpression,
  type Marker,
} from "leaflet";

const { height, width } = useWindowSize();
const locationMarkers = shallowReactive<Map<number, Marker | undefined>>(
  new Map()
);
const [greenIcon, orangeIcon, redIcon, done] = [
  "green",
  "orange",
  "red",
  "done",
].map((color) => {
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

const archipelago = useArchipelagoStore();

function getIcon(location: CheckLocation) {
  if (!archipelago.reachableLocations.has(location.id)) return redIcon;
  return location.far && !archipelago.completedItems.has(ItemIDs.Seaglide)
    ? orangeIcon
    : greenIcon;
}

function updateIcons() {
  console.log("Checked: ", archipelago.checkedLocations);
  console.log("Have: ", archipelago.completedItems);
  LOCATIONS.forEach((loc) => {
    const marker = locationMarkers.get(loc.id);
    if (!marker) return;
    if (!archipelago.checkedLocations.includes(loc.id)) {
      marker.setIcon(getIcon(loc));
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

onMounted(() => {
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
      .map((id) => `<li>${ITEMS[id].name}</li>`)
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
