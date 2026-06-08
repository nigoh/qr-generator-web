/// <reference types="@cloudflare/workers-types" />

/**
 * qr-dynamic-worker
 *
 * ビルド済みの静的SPA（dist/）を Cloudflare Workers の Static Assets 経由で配信する。
 * SPA のクライアントルーティングは wrangler.toml の
 * `not_found_handling = "single-page-application"` で index.html にフォールバックする。
 *
 * 動的QR（短縮URLのリダイレクト等）のエンドポイントを追加する場合は、
 * ASSETS への委譲前にこの fetch ハンドラ内でルーティングを行う。
 */
interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request, env): Promise<Response> {
    // 現状は静的アセットの配信のみ。将来の動的ルートはここに追加する。
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
