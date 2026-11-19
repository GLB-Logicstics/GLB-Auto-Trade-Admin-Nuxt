<template>
  <div class="shell">
    <AppSidebar />
    <div class="shell__main">
      <AppTopbar />
      <main class="shell__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.shell {
  min-height: 100vh;

  &__main {
    min-width: 0;

    @include up(lg) {
      margin-left: $sidebar;
    }
  }

  &__content {
    padding: 24px 16px 48px;

    @include up(md) {
      padding: 28px 32px 56px;
    }
  }
}
</style>
