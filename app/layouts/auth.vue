<template>
  <div class="auth-layout">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.auth-layout {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at 15% 20%, rgba($primary, 0.18), transparent 40%),
    radial-gradient(circle at 85% 80%, rgba($accent, 0.14), transparent 40%),
    $navy;
}
</style>
