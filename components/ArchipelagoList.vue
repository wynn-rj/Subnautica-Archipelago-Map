<script lang="ts" setup>
import { useArchipelagoStore } from "~/stores/archipelago";
import { ITEMS } from "~/utils/items";

const archipelago = useArchipelagoStore();
function itemNames(ids: Set<number>) {
  return [...ids].map((id) => ITEMS[id]?.name ?? "Unknown").join(", ");
}
</script>

<template>
  <div v-if="!archipelago.connected">Please connect first</div>
  <table v-else>
    <tbody>
      <!-- <template v-for="location of archipelago.locations">
        <tr v-if="!location.checked">
          <td>{{ location.name }}</td>
          <td>{{ location.position }}</td>
          <td>{{ location.reachable ? "Yes" : "No" }}</td>
          <td>{{ itemNames(location.needed_items) }}</td>
        </tr>
      </template> -->
    </tbody>
  </table>
</template>
