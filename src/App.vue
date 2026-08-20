<script setup lang="ts">
import { computed, shallowRef, watch, type Component } from 'vue'
import { RouterView, useRoute } from 'vue-router'

/**
 * The editing chrome owns every editor-only dialog, provider, and sidebar.
 * Keep that import dynamic so a visitor opening a public, authentication, or
 * settings route does not preload TipTap, D3, KaTeX, or Vue Flow merely by
 * booting the application shell.
 */
const route = useRoute()
const usesEditorShell = computed(() => route.matched.some((record) => record.meta.editorShell === true))
const editorAppShell = shallowRef<Component | null>(null)

watch(usesEditorShell, async (shouldLoadEditorShell) => {
  if (!shouldLoadEditorShell) {
    editorAppShell.value = null
    return
  }

  editorAppShell.value = (await import('@/components/EditorAppShell.vue')).default
}, { immediate: true })
</script>

<template>
  <component :is="editorAppShell" v-if="usesEditorShell && editorAppShell" />
  <RouterView v-else-if="!usesEditorShell" />
</template>
