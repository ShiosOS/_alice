<template>
  <section class="max-w-lg space-y-6">
    <h1 class="font-display text-3xl text-foreground">
      Account
    </h1>
    <p
      v-if="user"
      class="text-muted-foreground"
    >
      Signed in as <span class="text-foreground">{{ user.email }}</span>
    </p>

    <AlertDialog>
      <AlertDialogTrigger as-child>
        <Button
          variant="destructive"
          :disabled="isMutating"
        >
          {{ isMutating ? 'Deleting…' : 'Delete account' }}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes your account and all Rabbit Holes. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-white hover:bg-destructive/90"
            :disabled="isMutating"
            @click="deleteAccount"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <p
      v-if="error"
      class="text-sm text-destructive"
    >
      {{ error }}
    </p>
  </section>
</template>

<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

definePageMeta({
  middleware: ['auth'],
})

const { user, clear } = useUserSession()
const isMutating = ref(false)
const error = ref('')

async function deleteAccount() {
  isMutating.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/account', { method: 'DELETE' })
    await clear()
    await navigateTo('/')
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Delete failed'
  }
  finally {
    isMutating.value = false
  }
}
</script>
