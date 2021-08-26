<template>
  <div />
</template>

<script>
import customNode from "./customNode";
import linkEdge from "./linkEdge"

export default {
  name:'Flow',
  data() {
    return {
      page: null
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      customNode.init();
      linkEdge.init();
    }
  }
};
</script>


