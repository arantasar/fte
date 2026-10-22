import type { Ref } from "react";
import { Link, useLocation, type LinkProps } from "react-router-dom";
import { nodeUrl } from "../domain/paths";

interface NodeLinkProps extends Omit<LinkProps, "to"> {
  path: string;
  ref?: Ref<HTMLAnchorElement>;
}

/** Link do szczegółów węzła, który zachowuje bieżące parametry wyszukiwania (`?q=`). */
export function NodeLink({ path, ...props }: NodeLinkProps) {
  const { search } = useLocation();
  return <Link to={{ pathname: nodeUrl(path), search }} {...props} />;
}
