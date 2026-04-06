import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    links: {
      publication360:
        "http://www.omafra.gov.on.ca/english/crops/pub360/pub360A.htm",
      cropProtection:
        "http://www.omafra.gov.on.ca/english/crops/hort/news/allontario/",
      pestDiagnostic: "https://www.uoguelph.ca/pdp/",
      onfruit: "https://onfruit.ca/",
      weatherStations:
        "https://weather.gc.ca/city/pages/on-143_metric_e.html",
    },
    message: "OMAFRA resources for Ontario apple growers",
  });
}
