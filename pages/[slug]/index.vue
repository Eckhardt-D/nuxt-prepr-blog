<script lang="ts" setup>
const route = useRoute()
const { public: { preprUrl } } = useRuntimeConfig()
const slug = route.params.slug as string

const { data, error } = await useAsyncData(`blog:${slug}`, () => {
  return $fetch(preprUrl, {
    method: 'POST',
    body: {
      query: `
        query Article($slug: String!) {
        	Article (slug: $slug) { 
        		_id
        		title
        		seo_description
        		intro
        		content { 
        			__typename
              ... on YouTubePost {
                url
              }
              ... on Text {
                html
              }
              ... on Assets {
                _type
                items {
                  _type
                  url
                }
              }
            }
        	}
        }
      `,
      variables: { slug }
    },
  })
})

useSeoMeta({
  title: (data.value as any).data.Article.title,
  description: (data.value as any).data.Article.seo_description,
})
</script>

<template>
  <main class="min-h-screen bg-gray-900">
    <div v-if="error" class="p-5 text-red-500">
      {{ error.message }}
    </div>

    <div v-else class="prose prose-slate prose-invert mx-auto py-20">
      <h1>{{ (data as any).data.Article.title }}</h1>
      <p>{{ (data as any).data.Article.intro }}</p>

      <div v-for="item in (data as any).data.Article.content">
        <div v-if="item.__typename === 'Text'" v-html="item.html" />

          <div v-if="item.__typename === 'YouTubePost'">
            <LazyClientOnly>
            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=5j4CR9Rxfa8dqo6t" frameborder="0"></iframe>
            </LazyClientOnly>
          </div>

          <div v-if="item.__typename === 'Assets'">
            <div v-for="media in item.items">
              <img v-if="media._type === 'Photo'" :src="media.url">
            </div>
          </div>
        </div>
    </div>
  </main>
</template>
