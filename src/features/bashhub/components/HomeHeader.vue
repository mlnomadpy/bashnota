<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChevronDown,
  ExternalLink,
  FileUp,
  FolderOpen,
  Github,
  LogIn,
  Mail,
  Plus,
  Twitter,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useNotaImport } from '@/features/nota/composables/useNotaImport'
import { FILE_EXTENSIONS } from '@/constants/app'
import NewsletterModal from './NewsletterModal.vue'

defineProps<{
  isFilesystemMode?: boolean
  hasDirectoryAccess?: boolean
  directoryName?: string | null
}>()

const emit = defineEmits<{
  (event: 'create-nota'): void
  (event: 'select-directory'): void
}>()

const authStore = useAuthStore()
const router = useRouter()
const isNewsletterModalOpen = ref(false)
const { importNota, importJupyterNotebook, isImporting } = useNotaImport()

const greeting = computed(() => {
  const name = authStore.currentUser?.displayName
  return name ? `Welcome back, ${name}.` : 'Local-first notes for writing, code, and research.'
})

const handleImportNota = () => importNota([FILE_EXTENSIONS.nota])
const handleImportIpynb = () => importJupyterNotebook()
const openExternal = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')
</script>

<template>
  <aside class="flex h-full min-h-0 flex-col rounded-xl border bg-card text-card-foreground shadow-sm">
    <div class="p-5 lg:p-6">
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
          <img src="@/assets/logo.svg" alt="" class="h-7 w-7" />
        </div>
        <div class="min-w-0">
          <h1 class="text-xl font-semibold tracking-tight">BashNota</h1>
          <p class="mt-0.5 text-xs text-muted-foreground">Your private knowledge workspace</p>
        </div>
      </div>

      <p class="mt-5 text-sm leading-6 text-muted-foreground">{{ greeting }}</p>

      <Button
        aria-label="Create a nota"
        class="mt-5 min-h-11 w-full justify-start"
        size="lg"
        @click="emit('create-nota')"
      >
        <Plus aria-hidden="true" class="mr-2 h-4 w-4" />
        New nota
        <span class="ml-auto hidden text-xs font-normal opacity-70 xl:inline">Start writing</span>
      </Button>
    </div>

    <Separator />

    <nav aria-label="Workspace actions" class="space-y-1 p-3">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            aria-label="Import"
            variant="ghost"
            class="min-h-11 w-full justify-start px-3"
            :disabled="isImporting"
          >
            <FileUp aria-hidden="true" class="mr-3 h-4 w-4 text-muted-foreground" />
            {{ isImporting ? 'Importing…' : 'Import content' }}
            <ChevronDown aria-hidden="true" class="ml-auto h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-64">
          <DropdownMenuItem class="cursor-pointer py-2.5" :disabled="isImporting" @click="handleImportNota">
            <FileUp aria-hidden="true" class="mr-2 h-4 w-4" />
            <div>
              <div class="font-medium">Import Nota</div>
              <div class="text-xs text-muted-foreground">Import a .nota file</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer py-2.5" :disabled="isImporting" @click="handleImportIpynb">
            <FileUp aria-hidden="true" class="mr-2 h-4 w-4" />
            <div>
              <div class="font-medium">Jupyter notebook</div>
              <div class="text-xs text-muted-foreground">Import an .ipynb file</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        v-if="isFilesystemMode"
        variant="ghost"
        class="min-h-11 w-full justify-start px-3"
        @click="emit('select-directory')"
      >
        <FolderOpen aria-hidden="true" class="mr-3 h-4 w-4 text-muted-foreground" />
        <span class="truncate">
          {{ hasDirectoryAccess && directoryName ? directoryName : 'Choose nota directory' }}
        </span>
      </Button>

      <Button
        v-if="!authStore.isAuthenticated"
        variant="ghost"
        class="min-h-11 w-full justify-start px-3"
        @click="router.push('/login')"
      >
        <LogIn aria-hidden="true" class="mr-3 h-4 w-4 text-muted-foreground" />
        Sign in to publish
      </Button>

      <Button
        v-else
        variant="ghost"
        class="min-h-11 w-full justify-start px-3"
        @click="isNewsletterModalOpen = true"
      >
        <Mail aria-hidden="true" class="mr-3 h-4 w-4 text-muted-foreground" />
        Newsletter
      </Button>
    </nav>

    <div class="mt-auto border-t p-4">
      <p class="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Open source · your data stays yours
      </p>
      <div class="flex items-center gap-1">
        <Button
          aria-label="Open BashNota on GitHub"
          variant="ghost"
          size="sm"
          class="min-h-10 flex-1 justify-start"
          @click="openExternal('https://github.com/mlnomadpy/bashnota')"
        >
          <Github aria-hidden="true" class="mr-2 h-4 w-4" />
          GitHub
          <ExternalLink aria-hidden="true" class="ml-auto h-3.5 w-3.5 opacity-60" />
        </Button>
        <Button
          aria-label="Follow BashNota on X"
          variant="ghost"
          size="icon"
          class="h-10 w-10"
          @click="openExternal('https://twitter.com/bashnota')"
        >
          <Twitter aria-hidden="true" class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </aside>

  <NewsletterModal :open="isNewsletterModalOpen" @update:open="isNewsletterModalOpen = $event" />
</template>
