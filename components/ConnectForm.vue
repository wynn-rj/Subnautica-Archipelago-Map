<script lang="ts" setup>
import { useArchipelagoStore } from "~/stores/archipelago";

const archipelago = useArchipelagoStore();

const url = useLocalStorage("archipelago-server-url", "archipelago.gg");
const port = useLocalStorage("archipelago-server-port", 0);
const name = useLocalStorage("archipelago-server-name", "");

function connect() {
  const urlVal = url.value;
  const portVal = port.value;
  const nameVal = name.value;
  if (!urlVal || !portVal || !nameVal) return;
  archipelago.connect(urlVal, portVal, nameVal);
}
</script>

<template>
  <div class="block border bg-slate-800 border-gray-600 rounded-lg p-3 w-80">
    <form
      @submit.prevent="connect"
      v-if="!archipelago.connected"
      class="w-full"
    >
      <div class="flex">
        <label class="pt-1 inline-block text-white w-16" for="url">
          Url:
        </label>
        <input
          class="bg-gray-700 border border-gray-600 text-white rounded-lg block p-1"
          required
          type="text"
          id="url"
          name="url"
          v-model="url"
        />
      </div>
      <div class="flex">
        <label class="pt-1 inline-block text-white w-16" for="port">
          Port:
        </label>
        <input
          class="bg-gray-700 border border-gray-600 text-white rounded-lg block p-1"
          type="number"
          id="port"
          name="port"
          min="1"
          max="65525"
          v-model="port"
        />
      </div>
      <div class="flex">
        <label class="pt-1 inline-block text-white w-16" for="name">
          Name:
        </label>
        <input
          class="bg-gray-700 border border-gray-600 text-white rounded-lg block p-1"
          type="text"
          id="name"
          name="name"
          v-model="name"
        />
      </div>
      <button
        type="submit"
        class="text-white focus:ring-4 rounded-lg w-full p-1 my-1 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
      >
        Connect
      </button>
    </form>
    <div v-else class="text-white w-full">
      Connect to <strong>{{ url }}:{{ port }}</strong> as
      <strong>{{ name }}</strong>
      <br />
      Max Depth: -{{ archipelago.maxDepth }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
div {
  padding-bottom: 4px;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
