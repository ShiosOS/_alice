<template>
  <div
    class="flex flex-col"
    :class="fullBleed ? 'h-dvh overflow-hidden' : 'min-h-screen'"
  >
    <header
      class="z-30 flex shrink-0 items-center justify-between gap-4 border-b border-border/80 bg-[#0f1419]/90 px-5 py-4 backdrop-blur"
    >
      <NuxtLink
        to="/"
        class="font-display text-2xl tracking-wide text-primary transition-opacity hover:opacity-90"
      >
        _alice
      </NuxtLink>
      <nav class="flex items-center gap-4 text-sm text-foreground">
        <template v-if="loggedIn">
          <NuxtLink
            to="/rabbit-holes"
            class="text-muted-foreground transition-colors hover:text-foreground"
            active-class="!text-primary"
          >
            Rabbit Holes
          </NuxtLink>
          <NuxtLink
            to="/account"
            class="text-muted-foreground transition-colors hover:text-foreground"
            active-class="!text-primary"
          >
            Account
          </NuxtLink>
          <Button variant="ghost" size="sm" as-child>
            <a href="/auth/logout">Sign out</a>
          </Button>
        </template>
        <Button v-else as-child>
          <a href="/auth/google">Sign in with Google</a>
        </Button>
      </nav>
    </header>

    <main
      :class="fullBleed
        ? 'relative min-h-0 w-full flex-1 p-0'
        : 'mx-auto w-full max-w-[1100px] flex-1 px-5 py-6 pb-8'"
    >
      <NuxtPage />
    </main>

    <footer
      v-if="!fullBleed"
      class="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-sm text-muted-foreground"
    >
      <span>Wonderland map for YouTube</span>
      <span class="flex gap-2">
        <NuxtLink to="/privacy" class="hover:text-foreground">Privacy</NuxtLink>
        <span aria-hidden="true">·</span>
        <NuxtLink to="/terms" class="hover:text-foreground">Terms</NuxtLink>
        <span aria-hidden="true">·</span>
        <NuxtLink to="/about" class="hover:text-foreground">About</NuxtLink>
      </span>
    </footer>

    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&display=swap',
    },
  ],
})

const route = useRoute()
const fullBleed = computed(() => route.meta.fullBleed === true)
const { loggedIn } = useUserSession()
</script>
