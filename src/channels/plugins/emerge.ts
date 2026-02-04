import type { ChannelPlugin } from "./types.js";

const emergePlugin: ChannelPlugin = {
  id: "emerge",
  meta: {
    id: "emerge",
    label: "Emerge",
    selectionLabel: "Emerge",
    docsPath: "/channels/emerge",
    blurb: "Emerge channel integration",
    aliases: ["emerge"],
  },
  capabilities: {
    chatTypes: ["direct"],
  },
  config: {
    listAccountIds: (cfg) => {
      const channels = cfg.channels as Record<string, unknown> | undefined;
      const entry = channels?.emerge;
      if (!entry || typeof entry !== "object") return [];
      const accounts = (entry as { accounts?: Record<string, unknown> }).accounts;
      const ids = accounts ? Object.keys(accounts).filter(Boolean) : [];
      return ids.length > 0 ? ids : ["default"];
    },
    resolveAccount: (cfg, accountId) => {
      const channels = cfg.channels as Record<string, unknown> | undefined;
      const entry = channels?.emerge;
      if (!entry || typeof entry !== "object") return {};
      const accounts = (entry as { accounts?: Record<string, unknown> }).accounts;
      const match = typeof accountId === "string" ? accounts?.[accountId] : undefined;
      return (match && typeof match === "object") || typeof match === "string" ? match : entry;
    },
    isConfigured: async (_account, cfg) => {
      const channels = cfg.channels as Record<string, unknown> | undefined;
      return Boolean(channels?.emerge);
    },
  },
  outbound: {
    deliveryMode: "direct",
    sendText: async ({ deps, to, text }) => {
      // 这里需要实现发送消息的逻辑
      // 暂时返回一个模拟的消息ID
      return {
        channel: "emerge",
        messageId: `emerge-${Date.now()}`,
        recipient: to,
      };
    },
    sendMedia: async ({ deps, to, text, mediaUrl }) => {
      // 这里需要实现发送媒体消息的逻辑
      // 暂时返回一个模拟的消息ID
      return {
        channel: "emerge",
        messageId: `emerge-media-${Date.now()}`,
        recipient: to,
      };
    },
  },
};

export default emergePlugin;
