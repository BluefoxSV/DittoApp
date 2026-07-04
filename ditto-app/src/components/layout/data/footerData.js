
import { BiLocationPlus, BiMailSend, BiPhone } from "react-icons/bi";


const footerData = [
  {
    title: "Productos",
    items: [
      { label: "FOXPOS ERP", to: "/foxpos-erp" },
      { label: "FOXCLASSIFIER", to: "/foxclassifier" },
      { label: "BLUEFOX Development", to: "/bluefox-development" },
      { label: "FOXPOS DTE's", to: "/foxpos-dtes" },
    ],
  },
  {
    title: "Links de Interés",
    items: [
      { label: "Términos y Condiciones", to: "/terminos" },
      { label: "Precios", to: "/precios" },
      { label: "Ayuda", to: "/ayuda" },
      { label: "Solicitar Demo", to: "/demo" },
    ],
  },
  {
    title: "Contacto",
    items: [
      { label: "San Salvador, El Salvador", icon: BiLocationPlus },
      { label: "gestiones@bluefoxsv.com", icon: BiMailSend, href: "mailto:contacto@bluefoxsv.com" },
      { label: "+503 0000-0000", icon: BiPhone, href: "tel:+50300000000" },
    ],
  },
];

export default footerData;