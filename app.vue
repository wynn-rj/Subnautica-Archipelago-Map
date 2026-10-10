<script setup lang="ts"></script>

<template>
  <div>
    <ClientOnly>
      <ConnectForm
        style="position: absolute; top: 20px; left: 20px; z-index: 1000"
      />
      <InteractiveMap />
    </ClientOnly>
  </div>
</template>
