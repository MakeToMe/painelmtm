import { Cloud, Database, MessageSquare, Settings, Code } from "lucide-react";

export const services = [
  {
    icon: <Cloud className="w-6 h-6 text-emerald-500" />,
    title: "Infraestrutura",
    products: [
      {
        name: "al.com",
        logo: "/logos/al-com.png"
      },
      {
        name: "WPPConnect-Server",
        logo: "/logos/wppconnect.png"
      }
    ]
  },
  {
    icon: <Database className="w-6 h-6 text-emerald-500" />,
    title: "Banco de Dados",
    products: [
      {
        name: "Chatwoot",
        logo: "/logos/chatwoot.png"
      },
      {
        name: "Botpress",
        logo: "/logos/botpress.png"
      }
    ]
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
    title: "Comunicação",
    products: [
      {
        name: "ToolJet",
        logo: "/logos/tooljet.png"
      },
      {
        name: "Evolution API",
        logo: "/logos/evolution.png"
      }
    ]
  },
  {
    icon: <Settings className="w-6 h-6 text-emerald-500" />,
    title: "Automações",
    products: [
      {
        name: "Supabase",
        logo: "/logos/supabase.png"
      },
      {
        name: "N8N",
        logo: "/logos/n8n.png"
      }
    ]
  },
  {
    icon: <Code className="w-6 h-6 text-emerald-500" />,
    title: "Construtores",
    products: [
      {
        name: "Traefik",
        logo: "/logos/traefik.png"
      }
    ]
  }
];