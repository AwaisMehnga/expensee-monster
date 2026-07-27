import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import routes from "./routes";

export default function Approuter() {
  const element = useRoutes(routes);

  return <Suspense fallback={"Loading..."}>{element}</Suspense>;
}
