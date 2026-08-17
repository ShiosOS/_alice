<template>
  <div class="mx-auto flex max-w-md flex-col items-start gap-4 py-10">
    <h2 class="font-display text-2xl text-foreground">
      <slot name="title">
        Nothing here yet
      </slot>
    </h2>
    <p class="leading-relaxed text-muted-foreground">
      <slot name="description" />
    </p>
    <div
      v-if="$slots.action"
      class="pt-1"
    >
      <slot name="action" />
    </div>
  </div>
</template>
