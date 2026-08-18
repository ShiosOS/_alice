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
      <nav
        v-if="loggedIn"
        class="flex items-center gap-4 text-sm text-foreground"
      >
        <NuxtLink
          to="/rabbit-holes"
          class="ink-nav-link"
          active-class="!text-foreground !font-medium"
        >
          Rabbit Holes
        </NuxtLink>
        <NuxtLink
          to="/account"
          class="ink-nav-link"
          active-class="!text-foreground !font-medium"
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
      </nav>
    </header>

    <main :class="fullBleed ? 'ink-shell-main-bleed' : 'ink-shell-main'">
      <div
        :key="route.fullPath"
        :class="fullBleed ? undefined : 'ink-page-enter'"
      >
        <NuxtPage />
      </div>
    </main>

    <footer
      v-if="!fullBleed"
      class="ink-shell-footer"
    >
      <span>Maps for YouTube rabbit holes</span>
      <span class="flex gap-2">
        <NuxtLink to="/privacy">Privacy</NuxtLink>
        <span aria-hidden="true">·</span>
        <NuxtLink to="/terms">Terms</NuxtLink>
        <span aria-hidden="true">·</span>
        <NuxtLink to="/about">About</NuxtLink>
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
