import PocketBase from 'pocketbase'

// 透過 Vite proxy 轉發到 PocketBase
const pb = new PocketBase(
  import.meta.env.VITE_POCKETBASE_URL || window.location.origin
)

export default pb
