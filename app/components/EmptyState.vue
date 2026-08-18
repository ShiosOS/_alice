<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'Nothing here yet',
  description: '',
})
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-start gap-4 py-10">
    <h2 class="font-display text-2xl text-foreground">
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="leading-relaxed text-muted-foreground"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots.action"
      class="pt-1"
    >
      <slot name="action" />
    </div>
  </div>
</template>
