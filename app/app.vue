<template>
  <NuxtLayout :name="$route.path === '/login' ? 'auth' : 'default'">
    <NuxtPage />
  </NuxtLayout>
  <ToastList />
</template>
