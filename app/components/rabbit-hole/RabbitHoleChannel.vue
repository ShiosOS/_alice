<script setup lang="ts">
import type { RabbitHoleGraph } from '#shared/types/rabbit-holes'
import {
  ancestorChainToFocus,
  childForksForNode,
  findNodeById,
  graphOutlineRows,
  pathTrailNodes,
  resolveDefaultFocusId,
} from '~/utils/channel-graph'
import ChannelAside from '~/components/rabbit-hole/ChannelAside.vue'
import ConnectionShaft from '~/components/rabbit-hole/ConnectionShaft.vue'
import FocusBlock from '~/components/rabbit-hole/FocusBlock.vue'
import ForkBlockList from '~/components/rabbit-hole/ForkBlockList.vue'
import HoleHeader from '~/components/rabbit-hole/HoleHeader.vue'

const props = defineProps<{
  holeGraph: RabbitHoleGraph
  isMutating?: boolean
  editing: boolean
  draftTitle: string
}>()

const emit = defineEmits<{
  'expand': [nodeId: string]
  'watch': [nodeId: string]
  'update:draftTitle': [value: string]
  'startEdit': []
  'saveTitle': []
  'delete': []
  'retryBootstrap': []
}>()

const focusedId = ref<string | null>(null)

watch(
  () => props.holeGraph.rabbitHole.id,
  () => {
    focusedId.value = resolveDefaultFocusId(props.holeGraph)
  },
  { immediate: true },
)

watch(
  () => ({
    nodeKey: props.holeGraph.nodes.map(n => n.id).join('|'),
    pathKey: props.holeGraph.path.map(p => p.nodeId).join('|'),
  }),
  () => {
    const stillExists = props.holeGraph.nodes.some(n => n.id === focusedId.value)
    if (!focusedId.value || !stillExists) {
      focusedId.value = resolveDefaultFocusId(props.holeGraph)
    }
  },
)

const focused = computed(() => {
  if (!focusedId.value) return null
  return findNodeById(props.holeGraph.nodes, focusedId.value)
})

const forks = computed(() => {
  if (!focusedId.value) return []
  return childForksForNode(props.holeGraph, focusedId.value)
})

const chain = computed(() => {
  if (!focusedId.value) return []
  return ancestorChainToFocus(props.holeGraph, focusedId.value)
})

/** Ancestors above the focused node (structural connections). */
const ancestors = computed(() => {
  if (chain.value.length <= 1) return []
  return chain.value.slice(0, -1)
})

const arrivalPhrase = computed(() => {
  const tip = chain.value[chain.value.length - 1]
  return tip?.inboundPhrase ?? null
})

const trail = computed(() => pathTrailNodes(props.holeGraph))

const outlineRows = computed(() => graphOutlineRows(props.holeGraph))

const pathIds = computed(
  () => new Set(props.holeGraph.path.map(entry => entry.nodeId)),
)

function setFocus(nodeId: string) {
  focusedId.value = nodeId
}

function onExpand() {
  if (!focusedId.value) return
  emit('expand', focusedId.value)
}

function onWatch() {
  if (!focusedId.value) return
  emit('watch', focusedId.value)
}

defineExpose({
  focusedId,
  setFocus,
})
</script>

<template>
  <div class="channel-surface">
    <HoleHeader
      :title="holeGraph.rabbitHole.title"
      :status="holeGraph.rabbitHole.status"
      :editing="editing"
      :draft-title="draftTitle"
      :is-mutating="isMutating"
      @update:draft-title="emit('update:draftTitle', $event)"
      @start-edit="emit('startEdit')"
      @save-title="emit('saveTitle')"
      @delete="emit('delete')"
      @retry-bootstrap="emit('retryBootstrap')"
    />

    <div class="channel-layout">
      <div class="channel-main">
        <ConnectionShaft
          :chain="ancestors"
          @select="setFocus"
        />

        <p
          v-if="arrivalPhrase"
          class="channel-arrival mb-3"
        >
          <span class="channel-shaft-phrase">{{ arrivalPhrase }}</span>
        </p>

        <FocusBlock
          v-if="focused"
          :node="focused"
          :is-mutating="isMutating"
          @watch="onWatch"
          @expand="onExpand"
        />
        <p
          v-else
          class="text-sm text-muted-foreground"
        >
          No videos in this Rabbit Hole yet.
        </p>

        <ForkBlockList
          :forks="forks"
          @select="setFocus"
        />
      </div>

      <ChannelAside
        :outline-rows="outlineRows"
        :trail="trail"
        :focused-id="focusedId"
        :path-ids="pathIds"
        @select="setFocus"
      />
    </div>
  </div>
</template>
