<template>
  <div
    class="flex flex-col"
    :class="fullBleed ? 'h-dvh overflow-hidden' : 'min-h-screen'"
  >
    <header class="ink-shell-header">
      <NuxtLink
        to="/"
        class="ink-brand"
      >
        _alice
      </NuxtLink>
      <nav class="flex items-center gap-4 text-sm text-foreground">
        <template v-if="loggedIn">
          <NuxtLink
            to="/rabbit-holes"
            class="ink-nav-link"
            active-class="!text-primary"
          >
            Rabbit Holes
          </NuxtLink>
          <NuxtLink
            to="/account"
            class="ink-nav-link"
            active-class="!text-primary"
          >
            Account
          </NuxtLink>
          <Button
            variant="ghost"
            size="sm"
            as-child
          >
            <a href="/auth/logout">Sign out</a>
          </Button>
        </template>
        <Button
          v-else
          as-child
        >
          <a href="/auth/google">Sign in with Google</a>
        </Button>
      </nav>
    </header>

    <main :class="fullBleed ? 'ink-shell-main-bleed' : 'ink-shell-main'">
      <NuxtPage />
    </main>

    <footer
      v-if="!fullBleed"
      class="ink-shell-footer"
    >
      <span>Rabbit Holes for YouTube</span>
      <span class="flex gap-2">
        <NuxtLink
          to="/privacy"
          class="hover:text-foreground"
        >Privacy</NuxtLink>
        <span aria-hidden="true">·</span>
        <NuxtLink
          to="/terms"
          class="hover:text-foreground"
        >Terms</NuxtLink>
        <span aria-hidden="true">·</span>
        <NuxtLink
          to="/about"
          class="hover:text-foreground"
        >About</NuxtLink>
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
      href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap',
    },
  ],
})

const route = useRoute()
const fullBleed = computed(() => route.meta.fullBleed === true)
const { loggedIn } = useUserSession()
</script>
