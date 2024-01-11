<script lang="ts" setup>
const {public: { preprUrl } } = useRuntimeConfig()
const nuxtApp = useNuxtApp()

/**

Issue: this is untyped. See the `codegen` branch
for typed GraphQL requests and queries.

*/
const { data, error } = await useAsyncData('site_details', () => {
  return $fetch(preprUrl, {
    method: 'POST',
    body: {
      query: `
        query Site {
          Site {
            title
            description
            seo_image {
              _type
              url
            }
            headline
            catchphrase
          }
        }
      `,
    }
  })
}, {
  deep: false,
  // @ts-expect-error payload static of type unknown
  getCachedData: key => nuxtApp.payload?.static?.[key]
    ?? nuxtApp.payload?.data?.[key],
});

const { data: blogData, error: blogError, pending } = await useAsyncData(
  'blogs',
  () => {
    return $fetch(preprUrl, {
      method: 'POST',
      body: {
        query: `
          query Articles($skip: Int, $limit: Int, $sort: ArticleSortInput) {
            Articles(skip: $skip, limit: $limit, sort: $sort) {
              items {
                _id
                _slug
                _created_on
                _read_time
                title
                intro
              }
            }
          }
        `
      },
      variables: {
        limit: 100
      }
    })
  }
)

useSeoMeta({
 title: data.value.data.Site.title,
 description: data.value.data.Site.description,
 ogImage: data.value.data.Site.seo_image.url,
})
</script>

<template>
  <main>
    <div v-if="error" class="p-5 text-red-500">{{error.message}}</div>
    <div v-else class="min-h-screen bg-gradient-to-r bg-gray-900 text-gray-200">
      <div class="py-24">
        <h1 class="font-bold text-center text-5xl lg:text-7xl tracking-tighter">
          {{ data.data.Site.headline }}
        </h1>
        <p class="text-lg mt-4 text-center tracking-wider">
          {{ data.data.Site.catchphrase }}
        </p>
      </div>

      <div class="max-w-7xl mx-auto">
        <div v-if="!(pending && blogError)" class="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="article in (blogData as any).data.Articles.items"
            :key="article._id" class="border shadow p-4 rounded-lg"
          >
            <h1 class="text-xl font-bold">{{ article.title }}</h1>

            <p>
              <small class="text-xs text-gray-500">
                <Icon name="ph:clock" class="mr-1" />{{ article._read_time }} Min.
              </small>
            </p>

            <p class="tracking-wider text-sm text-gray-400 my-5">
              {{ article.intro }}
            </p>

            <NuxtLink :to="`/${article._slug}`" class="flex items-center gap-2 hover:text-purple-400 transition-colors">
              Read more <Icon size="20" name="ph:arrow-circle-right" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
