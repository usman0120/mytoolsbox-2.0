import Image from "next/image";
import logo from "../../../public/logo.png";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, eager = false }: { className?: string; eager?: boolean }) {
  return <Image src={logo} alt="MyToolsBox" sizes="64px"
    loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"}
    className={cn("h-10 w-auto shrink-0 object-contain", className)} />;
}
