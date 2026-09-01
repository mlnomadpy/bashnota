import { defineStore } from 'pinia'
import type { Editor } from '@/features/editor/pm'
import { ref, shallowRef } from 'vue'
import { toast } from '@/services/toast'

export const useEditorStore = defineStore('editor', () => {
  // Use shallowRef so Vue does not deep-proxy the TipTap Editor instance
  const activeEditor = shallowRef<Editor | null>(null)
  const activeEditorComponent = ref<any>(null)

  function setActiveEditor(editor: Editor | null) {
    activeEditor.value = editor
  }

  function setActiveEditorComponent(component: any) {
    activeEditorComponent.value = component
  }

  async function saveVersion() {
    if (!activeEditorComponent.value?.saveVersion) {
      throw new Error('No active editor found.')
    }
    await activeEditorComponent.value.saveVersion()
  }

  function openHistory() {
    try {
      if (activeEditorComponent.value && activeEditorComponent.value.showVersionHistory !== undefined) {
        activeEditorComponent.value.showVersionHistory = true
        toast('Version history opened', {
          description: 'You can now view and restore previous versions.',
          duration: 3000
        })
      } else {
        toast('Unable to open history', {
          description: 'No active editor found.',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Error opening history:', error)
      toast('Failed to open version history', {
        description: 'An error occurred while opening the version history.',
        duration: 3000
      })
    }
  }

  return { 
    activeEditor, 
    activeEditorComponent,
    setActiveEditor, 
    setActiveEditorComponent,
    saveVersion,
    openHistory
  }
})
