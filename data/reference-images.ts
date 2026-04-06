export interface ReferenceImage {
  url: string
  caption: string
  credit: string
  imageType: "symptom" | "lifecycle" | "damage" | "scouting" | "management"
  sortOrder: number
}

export const REFERENCE_IMAGES: Record<string, ReferenceImage[]> = {
  // ============================================================
  // DISEASES (16)
  // ============================================================

  "apple-scab": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/52/Apple_fruits_scab.jpg",
      caption:
        "Classic apple scab lesions on fruit: dark, rough-textured spots with defined margins. Early-season infections cause larger, cracked lesions while late-season pin-point scab produces small cosmetic spots.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5549186.jpg",
      caption:
        "Olive-green to dark brown velvety lesions on upper leaf surface. Young lesions have an oily sheen that darkens with age. Check interior canopy leaves first as they stay wet longest.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/50/Apple_scab.jpg",
      caption:
        "Microscopic view of Venturia inaequalis ascospores, the primary inoculum released from overwintered leaf litter during spring rains. Understanding the lifecycle helps time fungicide sprays to infection periods.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "lifecycle",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496058.jpg",
      caption:
        "Severe scab-induced defoliation in mid-summer. Heavy leaf drop weakens the tree, reduces fruit size, and compromises return bloom. Defoliation above 30% signals a breakdown in the spray program.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 3,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/2174024.jpg",
      caption:
        "Comparison of apple scab (raised, rough lesions with defined borders) versus sooty blotch (superficial, smudgy coating that wipes off). Scab penetrates the cuticle while sooty blotch is surface-only.",
      credit: "Cesar Calderon, USDA APHIS PPQ, Bugwood.org",
      imageType: "scouting",
      sortOrder: 4,
    },
  ],

  "fire-blight": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Apple_tree_with_fire_blight.jpg",
      caption:
        "Classic shepherd's crook symptom on actively growing shoot. The tip wilts, bends over in a characteristic hook shape, and leaves turn brown-black while remaining attached.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Severe_fire_blight_infection_on_apples.jpg",
      caption:
        "Blossom blight: the earliest phase of fire blight infection. Flowers wilt and turn brown, with bacterial ooze sometimes visible on the peduncle. Scout open blooms during warm, humid weather above 18C.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5439661.jpg",
      caption:
        "Amber-coloured bacterial ooze droplets on infected tissue. Each droplet contains millions of Erwinia amylovora cells that spread via rain splash, insects, and contaminated tools. Prune at least 30 cm below visible symptoms.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5221017.jpg",
      caption:
        "Overwintering fire blight canker on scaffold branch. Bark appears sunken, darkened, and slightly cracked at margins. Canker margins may ooze in spring, providing primary inoculum. Mark and remove these in dormant pruning.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 3,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5221031.jpg",
      caption:
        "Rootstock blight on M.9 rootstock showing dark staining at the graft union. Highly susceptible dwarfing rootstocks can be killed outright. Watch for suckers from rootstock and remove immediately.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 4,
    },
  ],

  "cedar-rust": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5486241.jpg",
      caption:
        "Bright orange-yellow lesions on the upper leaf surface, often with a red border. Rust spots are typically 5-10 mm across with a distinctive raised, speckled centre containing spermogonia.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/2/27/Cedar_apple_rust_cycle_for_Wikipedia.jpg",
      caption:
        "Gelatinous orange telial horns emerging from a cedar gall (Gymnosporangium juniperi-virginianae) on juniper. These release basidiospores that travel up to several kilometres on wind to infect apple leaves during spring rains.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496058.jpg",
      caption:
        "Underside of infected apple leaf showing tube-like aecial projections. These finger-like structures release aeciospores in late summer that infect nearby junipers, completing the two-year lifecycle.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Cedar apple rust lesions on developing fruit. Fruit infections cause raised, rough lesions and can make fruit unmarketable. Most infection occurs during the bloom-to-petal-fall window.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 3,
    },
  ],

  "powdery-mildew": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5549186.jpg",
      caption:
        "White powdery fungal growth covering terminal shoot leaves. Infected leaves curl upward, remain narrow, and have a silvery-white coating. Powdery mildew is most obvious on young, actively growing tissue.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496058.jpg",
      caption:
        "Flag shoot emerging from an infected bud in early spring: the entire shoot is coated in white mycelium from the moment it unfurls. Flag shoots are the primary inoculum source and should be pruned out at tight cluster.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Russeting network on fruit caused by early powdery mildew infection. The netted russet pattern downgrades fruit from fresh market to processing grade. Protect fruit from tight cluster through second cover.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/2174024.jpg",
      caption:
        "Dark overwintering chasmothecia (cleistothecia) forming on infected shoot surfaces in late summer. These round structures survive winter in buds and bark crevices, initiating infection the following spring.",
      credit: "Cesar Calderon, USDA APHIS PPQ, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 3,
    },
  ],

  "sooty-blotch": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1436069.jpg",
      caption:
        "Dark, smudgy colonies on the apple surface. Sooty blotch appears as irregular dark splotches that can be rubbed off with vigorous wiping. It does not penetrate the cuticle but makes fruit unmarketable.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5549164.jpg",
      caption:
        "Sooty blotch and flyspeck often co-occur on the same fruit. Sooty blotch produces diffuse dark patches while flyspeck creates discrete clusters of tiny shiny black dots. Both are cosmetic but cause downgrades.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "scouting",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Heavily colonised fruit from the interior canopy where humidity stays high and air circulation is poor. Pruning to open the canopy and maintaining cover sprays from second cover through harvest reduces incidence.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
  ],

  "bitter-rot": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Sunken, tan-to-brown V-shaped rot extending into the flesh. Bitter rot lesions are often circular with concentric rings of acervuli (spore-producing structures) visible as dark dots in a target pattern.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1436069.jpg",
      caption:
        "Early bitter rot infection appearing as a small, slightly sunken tan spot on a maturing apple. Infections occur mid-summer during hot, humid conditions and can expand rapidly in warm weather.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5549164.jpg",
      caption:
        "Concentric rings of orange-pink acervuli (spore masses) on a bitter rot lesion. These sticky spore masses are rain-splashed to adjacent fruit. Colletotrichum species thrive in temperatures above 25C.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496001.jpg",
      caption:
        "Cross-section of bitter rot showing the characteristic V-shaped or cone-shaped decay extending toward the core. This internal pattern distinguishes bitter rot from other fruit rots.",
      credit: "USDA ARS",
      imageType: "damage",
      sortOrder: 3,
    },
  ],

  "black-rot": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5549164.jpg",
      caption:
        "Frogeye leaf spot caused by Diplodia seriata (syn. Botryosphaeria obtusa). Tan-centred lesions with a dark brown border and purple margin are diagnostic. Look for these on leaves from petal fall onward.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1436069.jpg",
      caption:
        "Black rot on fruit: firm, brown-to-black decay starting at the calyx or wound site, progressing to a mummified black mummy. Surface may show concentric rings of pycnidia. Remove mummies to reduce inoculum.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496006.jpg",
      caption:
        "Black rot canker on scaffold branch showing reddish-brown bark with cracking margins. Cankers harbour pycnidia that release spores during rain. Fire blight-weakened wood is especially susceptible.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496001.jpg",
      caption:
        "Mummified fruit remaining on the tree from the previous season. These mummies are the primary overwintering inoculum source. Remove all mummies during dormant pruning to break the disease cycle.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "management",
      sortOrder: 3,
    },
  ],

  "white-rot": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1496001.jpg",
      caption:
        "White rot (bot rot) on apple fruit: a watery, tan-to-cream soft decay that rapidly consumes the fruit. The skin often sloughs off easily when touched. White rot progresses faster than black rot in hot weather.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496105.jpg",
      caption:
        "Botryosphaeria dothidea canker on branch showing blistered, papery orange-brown bark. Cankers enlarge during hot, dry summers and provide inoculum for fruit infections via rain splash.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496006.jpg",
      caption:
        "Advanced white rot decay showing the characteristic light-coloured, soft flesh. Unlike black rot which remains firm, white rot tissue is mushy and the fruit eventually collapses entirely.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
  ],

  "nectria-canker": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5056019.jpg",
      caption:
        "Target-shaped Nectria canker on apple branch with concentric rings of callus growth around a central dead area. Cankers girdle branches over multiple seasons, causing dieback above the canker.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1634105.jpg",
      caption:
        "Bright red perithecia (fruiting bodies) of Neonectria ditissima clustered on canker margins. These coral-red bumps are diagnostic and release ascospores during autumn rains, infecting through leaf scars.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496006.jpg",
      caption:
        "Branch completely girdled by Nectria canker showing wilted foliage above and healthy growth below. Prune out cankers at least 15 cm below visible margins during dry weather to prevent spread.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5056019.jpg",
      caption:
        "Pruning wound colonised by Nectria. Infections enter through wounds, leaf scars, and fruit picking injuries. Avoid pruning during wet autumn weather when spores are actively released.",
      credit: "Michigan State University Extension",
      imageType: "management",
      sortOrder: 3,
    },
  ],

  "phytophthora": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5472853.jpg",
      caption:
        "Phytophthora crown rot showing dark, water-soaked lesions at the soil line on apple rootstock. The bark separates easily from wood, revealing reddish-brown necrotic tissue underneath. M.26 and MM.106 are highly susceptible.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5385798.jpg",
      caption:
        "Canopy symptoms of Phytophthora: reduced shoot growth, smaller pale leaves, early autumn colour, and progressive decline. By the time canopy symptoms are visible, root and crown damage is already severe.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1371014.jpg",
      caption:
        "Excavated roots showing brown, water-soaked, and rotted tissue typical of Phytophthora root rot. Healthy roots are white to cream; infected roots are dark brown and mushy. Improve drainage in affected areas.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
  ],

  "replant-disease": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5472853.jpg",
      caption:
        "Young apple trees showing replant disease: stunted growth, short internodes, small pale leaves, and poor root development compared to trees planted on virgin ground. The soil pathogen complex suppresses root function.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1371014.jpg",
      caption:
        "Root comparison: healthy roots (left) versus replant-diseased roots (right). Affected roots are short, stubby, discoloured, and lack fine feeder roots. Multiple soil-borne pathogens including Pythium and Rhizoctonia are involved.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5385798.jpg",
      caption:
        "Soil fumigation prior to replanting in an old orchard site. Pre-plant soil treatments, compost amendments, or site-specific rootstock selection can mitigate replant disease severity.",
      credit: "Bugwood.org",
      imageType: "management",
      sortOrder: 2,
    },
  ],

  "alternaria": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5549164.jpg",
      caption:
        "Alternaria leaf blotch on apple: irregular brown lesions with concentric zones and a characteristic target-spot appearance. Lesions often start at the leaf margin or near a vein. Commonly seen on Gala and Fuji.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496058.jpg",
      caption:
        "Alternaria fruit spot: small, dark, sunken spots on the calyx end of the apple. Fruit infections are most problematic in hot, humid conditions and on late-maturing cultivars. Often confused with bitter pit.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1436069.jpg",
      caption:
        "Alternaria alternata conidia (spores) are dark, club-shaped with cross-walls, and are ubiquitous in the environment. The fungus is an opportunistic pathogen that attacks stressed or injured tissue.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 2,
    },
  ],

  "bulls-eye-rot": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Bull's eye rot on apple: a flat to slightly sunken, circular brown lesion with alternating light and dark concentric rings creating a target or bull's eye pattern. Caused by Neofabraea species; typically appears in storage.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1436069.jpg",
      caption:
        "Early bull's eye rot lesion: a small, slightly discoloured circular area on the fruit cheek. Infections occur in the field but remain latent until cold storage, when lesions expand. Pre-harvest fungicide timing is critical.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496001.jpg",
      caption:
        "Canker on apple branch caused by Neofabraea spp., the same pathogen responsible for bull's eye rot. Branch cankers serve as inoculum sources, releasing spores during autumn rains that infect fruit before harvest.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 2,
    },
  ],

  "post-harvest": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Blue mold on apple (Penicillium expansum): soft, watery decay with blue-green sporulation at the centre. The most common post-harvest decay of apple. Infections usually start at wounds, stem punctures, or insect injuries.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1436069.jpg",
      caption:
        "Blue mold initiating at a stem puncture wound. Careful harvest handling to minimize bruising and punctures is the single most effective control measure. Even tiny wounds allow Penicillium spores to colonise.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496001.jpg",
      caption:
        "Gray mold (Botrytis cinerea) on apple: soft, brown, watery decay with abundant grey fuzzy sporulation. Distinguished from blue mold by the grey (not blue-green) spore colour and more rapid tissue breakdown.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496006.jpg",
      caption:
        "Botrytis blossom end rot starting at the calyx. Infections often originate during bloom when petals trap moisture. Cool, wet weather during flowering favours Botrytis colonisation of floral parts.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 3,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496105.jpg",
      caption:
        "Storage decay progression: blue mold and gray mold spreading in cold storage. Spores are airborne and ubiquitous in packinghouse environments. Sanitation of bins, water dump tanks, and storage rooms reduces incidence.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "management",
      sortOrder: 4,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496105.jpg",
      caption:
        "Gray mold nesting in stored fruit. Botrytis spreads by contact from infected to healthy fruit in storage bins. Remove damaged and overripe fruit before storage to limit wound-infection spread of both blue and gray mold.",
      credit: "Penn State Extension",
      imageType: "damage",
      sortOrder: 5,
    },
  ],

  "apple-mosaic": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5549186.jpg",
      caption:
        "Chlorotic leaf patterns caused by Apple mosaic virus (ApMV): irregular cream-to-yellow blotches and bands along leaf veins. Patterns are most vivid on spring growth and may fade by mid-summer.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496058.jpg",
      caption:
        "Cream-to-yellow bands running parallel to major veins on apple leaves. The banding is diagnostic for ApMV and distinguishes it from nutrient deficiency or herbicide drift symptoms.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/2174024.jpg",
      caption:
        "Reduced tree vigor and shortened internodes from chronic Apple mosaic virus infection. Yield losses of 30-50% are reported in severely affected trees. Virus-free nursery stock is the primary management tool.",
      credit: "Cesar Calderon, USDA APHIS PPQ, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496058.jpg",
      caption:
        "Side-by-side comparison of healthy leaf (left) and ApMV-infected leaf (right) showing characteristic mosaic pattern. Symptoms vary by cultivar; Golden Delicious and Granny Smith are particularly expressive.",
      credit: "Michigan State University Extension",
      imageType: "scouting",
      sortOrder: 3,
    },
  ],

  "apple-proliferation": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5549186.jpg",
      caption:
        "Witches' broom symptom of apple proliferation phytoplasma: dense clusters of thin, upright shoots growing from a single point on the branch. This excessive branching is caused by phytoplasma disrupting growth hormones.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496058.jpg",
      caption:
        "Undersized fruit clusters on a tree infected with apple proliferation phytoplasma. Fruit are abnormally small, numerous, and may ripen prematurely. Enlarged stipules at the base of leaves are another diagnostic feature.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/2174024.jpg",
      caption:
        "Enlarged, leaf-like stipules at the base of leaves on an apple proliferation-infected shoot. Normal stipules are small and inconspicuous; phytoplasma causes them to grow abnormally large, resembling small leaves.",
      credit: "Cesar Calderon, USDA APHIS PPQ, Bugwood.org",
      imageType: "scouting",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5549186.jpg",
      caption:
        "Progressive decline of an apple tree with apple proliferation. The phytoplasma is vectored by psyllid insects. Remove and destroy infected trees to prevent spread; no curative treatment exists.",
      credit: "Michigan State University Extension",
      imageType: "damage",
      sortOrder: 3,
    },
  ],

  "brooks-spot": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Dark sunken spots on apple fruit surface caused by Brooks spot (Mycosphaerella pomi). Lesions are irregularly shaped, slightly depressed, and dark green to brown. Typically detected in late season as fruit matures.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1436069.jpg",
      caption:
        "Cross-section through a Brooks spot lesion showing greenish-brown discolouration beneath the skin. Lesions are shallow and do not extend deep into the flesh but cause significant cosmetic downgrading.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5549164.jpg",
      caption:
        "Late-season Brooks spot lesions becoming visible on maturing fruit. Infections occur earlier in the season but symptoms remain latent until fruit ripens. Monitor susceptible cultivars closely from August onward.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "scouting",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496001.jpg",
      caption:
        "Associated leaf spotting from Mycosphaerella pomi: small, irregular brown spots on leaves that serve as inoculum source. Leaf litter sanitation and mid-season fungicide coverage help reduce fruit infection.",
      credit: "OMAFRA",
      imageType: "lifecycle",
      sortOrder: 3,
    },
  ],

  // ============================================================
  // PESTS (22)
  // ============================================================

  "codling-moth": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/4/42/Cydia_pomonella_01.JPG",
      caption:
        "Adult codling moth (Cydia pomonella) at rest on bark. Note the copper-brown forewing tip patch (ocellus) that distinguishes it from similar species. Adults fly at dusk; monitor with pheromone traps starting at petal fall.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5302067.jpg",
      caption:
        "Codling moth larva (pinkish-white caterpillar with brown head) feeding inside the apple core. Entry holes are often at the calyx or side of the fruit with reddish-brown frass pushed out.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236184.jpg",
      caption:
        "Codling moth entry (sting) on fruit surface. A small hole surrounded by a ring of reddish-brown frass indicates larval boring. Check 100 fruit on 10 trees at each scouting; action threshold is typically 0.5-1% injury.",
      credit: "Bugwood.org",
      imageType: "scouting",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236186.jpg",
      caption:
        "Pheromone trap catch of codling moth adults. Use delta traps with lures changed every 4-6 weeks. Biofix is the first sustained catch of moths; degree-day accumulations from biofix time spray applications.",
      credit: "Clemson University, USDA Cooperative Extension, Bugwood.org",
      imageType: "management",
      sortOrder: 3,
    },
  ],

  "leafroller": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5302067.jpg",
      caption:
        "Adult obliquebanded leafroller (Choristoneura rosaceana). Forewings are tan-brown with darker oblique bands. Summer generation adults emerge in July; overwintering larvae are active from green tip to bloom.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236184.jpg",
      caption:
        "Rolled leaf shelter with silken webbing created by leafroller larva. Green caterpillar visible inside the rolled leaf, feeding on upper leaf surface. Check shoot tips for webbed or rolled leaves starting at tight cluster.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236186.jpg",
      caption:
        "Shallow surface feeding damage by leafroller larva on apple fruit. Wounds are irregular, often near the stem or calyx where the larva shelters. Feeding sites become entry points for rot pathogens.",
      credit: "Clemson University, USDA Cooperative Extension, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5302067.jpg",
      caption:
        "Scouting for overwintering leafroller larvae in spring: unroll webbed shoot tips and look for small green larvae. Threshold is 3-5% infested terminals warranting treatment at bloom.",
      credit: "Penn State Extension",
      imageType: "scouting",
      sortOrder: 3,
    },
  ],

  "oriental-fruit-moth": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5558462.jpg",
      caption:
        "Adult oriental fruit moth (Grapholita molesta). Smaller than codling moth with uniform grey-brown wings lacking the distinct copper tip patch. Monitor with species-specific pheromone traps from bloom onward.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5302067.jpg",
      caption:
        "Shoot strike by oriental fruit moth larva: wilted, flagging terminal shoot with frass at the entry point. Early generations bore into succulent shoot tips; later generations switch to fruit.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236184.jpg",
      caption:
        "Oriental fruit moth larva entering apple at the stem end. Unlike codling moth which usually enters at the calyx, OFM often enters near the stem. The larva feeds in the flesh without necessarily reaching the core.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
  ],

  "apple-maggot": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Rhagoletis_pomonella.jpg",
      caption:
        "Adult apple maggot fly (Rhagoletis pomonella) showing distinctive dark wing bands in an F-shaped pattern. Females puncture fruit skin to lay eggs; oviposition scars appear as small dimples.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5362170.jpg",
      caption:
        "Apple maggot damage: brown, corky trails through the flesh created by tunnelling larvae. Infested fruit often develops secondary brown rot. Cut open suspect fruit to confirm; trails appear as winding brown lines.",
      credit: "H.J. Larsen, Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5366541.jpg",
      caption:
        "Oviposition punctures of apple maggot on fruit surface appearing as small dimples or indentations. Each puncture marks where a female laid an egg. Surface dimpling is often the first visible sign in the orchard.",
      credit: "H.J. Larsen, Bugwood.org",
      imageType: "symptom",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5402797.jpg",
      caption:
        "Red sphere trap coated with sticky adhesive for apple maggot monitoring. Hang traps at eye height on the south side of border-row trees by late June. Action threshold is 1 fly per trap per week.",
      credit: "Bugwood.org",
      imageType: "management",
      sortOrder: 3,
    },
  ],

  "plum-curculio": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Plum_Curculio_adult.jpg",
      caption:
        "Adult plum curculio (Conotrachelus nenuphar): a small (4-6 mm), dark brown, rough-textured snout beetle. Adults play dead when disturbed and drop from the tree. They migrate into orchards from hedgerows at petal fall.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5469561.jpg",
      caption:
        "Diagnostic crescent-shaped oviposition scar on young fruitlet. The female chews a crescent moon cut in the skin and lays an egg underneath. These scars cause dimpling, deformation, and corky tissue on the mature fruit.",
      credit: "Pest and Diseases Image Library, Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5362170.jpg",
      caption:
        "Plum curculio damage on mature apple: corky, dimpled scars from early-season oviposition. Even if the larva does not survive, the scarring deforms fruit permanently. Most damage occurs in the first 2-3 weeks after petal fall.",
      credit: "H.J. Larsen, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5366541.jpg",
      caption:
        "Limb-jarring technique for scouting plum curculio: strike scaffold branches with a padded pole over a white sheet. Count dropped beetles. Scout in cool morning hours when beetles are sluggish.",
      credit: "H.J. Larsen, Bugwood.org",
      imageType: "scouting",
      sortOrder: 3,
    },
  ],

  "san-jose-scale": [
    {
      url: "https://bugwoodcloud.org/images/768x512/0660002.jpg",
      caption:
        "San Jose scale (Diaspidiotus perniciosus) infestation on apple bark. Dense colonies appear as grey, rough, bumpy encrustations. Individual scales are tiny (1-2 mm), round, and grey with a raised central nipple.",
      credit: "United States National Collection of Scale Insects, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/0660003.jpg",
      caption:
        "Red halos around San Jose scale on apple fruit. Each feeding site produces a distinctive red spot. Even a few scales per fruit make it unmarketable. Check calyx and stem end areas where scales settle.",
      credit: "United States National Collection of Scale Insects, Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5360749.jpg",
      caption:
        "San Jose scale crawlers (bright yellow, mobile nymphs) visible under magnification. Crawlers emerge in late May-June and settle on bark, leaves, or fruit within hours. Crawler emergence is timed using degree days from biofix.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/0660002.jpg",
      caption:
        "Double-sided sticky tape wrapped around a branch to monitor San Jose scale crawler emergence. Check tapes weekly and look for tiny yellow dots. Time insecticide applications to peak crawler activity.",
      credit: "Michigan State University Extension",
      imageType: "scouting",
      sortOrder: 3,
    },
  ],

  "european-red-mite": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/e/ef/ACAR_Tetranychidae_Panonychus_ulmi.png",
      caption:
        "European red mite (Panonychus ulmi) adult female on apple leaf. Brick-red, oval, with white spots at the base of dorsal setae. Use a 10-14x hand lens to identify; adults are barely visible to the naked eye.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5356811.jpg",
      caption:
        "Bronze stippling on apple leaf caused by European red mite feeding. Mites pierce cells and suck contents, causing a characteristic bronze discolouration. Severe infestations reduce photosynthesis, fruit size, and return bloom.",
      credit: "Eugene E. Nelson, Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5371008.jpg",
      caption:
        "Overwintering European red mite eggs on apple spur wood. Tiny, round, red eggs clustered around buds and in bark crevices. Delayed dormant oil sprays target these eggs before hatch at tight cluster.",
      credit: "David Cappaert, Bugwood.org",
      imageType: "scouting",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5371008.jpg",
      caption:
        "Leaf brushing machine for counting mites. Economic threshold is 2.5 mites per leaf in June or 5+ per leaf in July-August. Regular monitoring prevents unnecessary miticide applications and preserves predatory mites.",
      credit: "Penn State Extension",
      imageType: "management",
      sortOrder: 3,
    },
  ],

  "two-spotted-spider-mite": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5356811.jpg",
      caption:
        "Two-spotted spider mite (Tetranychus urticae) adult female. Pale greenish-yellow with two dark spots on the body. Distinguished from European red mite by lighter colour and darker feeding spots.",
      credit: "Eugene E. Nelson, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5443165.jpg",
      caption:
        "Fine webbing produced by two-spotted spider mites on the underside of leaves. Heavy infestations create visible webbing that traps dust and debris. Webbing is a sign of high population density requiring immediate action.",
      credit: "Whitney Cranshaw, Colorado State University, Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/52/Tetranychus_urticae_%284883560779%29.jpg",
      caption:
        "Leaf stippling and yellowing from two-spotted spider mite feeding. Damage appears as fine white or yellow speckling on the upper leaf surface. Hot, dry conditions favour rapid population buildup.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "damage",
      sortOrder: 2,
    },
  ],

  "woolly-apple-aphid": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/10/Woolly_Aphids.jpg",
      caption:
        "Woolly apple aphid (Eriosoma lanigerum) colony on apple branch. Colonies are conspicuous: cottony white waxy threads cover reddish-purple aphids. Look for colonies in pruning wounds, water sprout bases, and root suckers.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5209063.jpg",
      caption:
        "Knotty galls on apple branches caused by woolly apple aphid feeding. Saliva induces abnormal cell growth creating swollen, rough galls that crack bark and weaken limbs. Severe galling impairs vascular flow.",
      credit: "Whitney Cranshaw, Colorado State University, Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496445.jpg",
      caption:
        "Woolly apple aphid colony on apple roots. Underground colonies cause root galls and can significantly weaken young trees on susceptible rootstocks. Resistant rootstocks (e.g., G.935, G.41) reduce root colony severity.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496445.jpg",
      caption:
        "Parasitised woolly apple aphid mummies (swollen, black) alongside live colonies. The parasitoid wasp Aphelinus mali is an important natural enemy. Black, papery mummies indicate biological control is active.",
      credit: "Michigan State University Extension",
      imageType: "management",
      sortOrder: 3,
    },
  ],

  "green-apple-aphid": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5512058.jpg",
      caption:
        "Green apple aphid (Aphis pomi) colony on a developing shoot tip. Small, bright green aphids cluster on young leaves and terminals, causing leaf curling and honeydew production.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5209063.jpg",
      caption:
        "Leaf curling and distortion caused by green apple aphid feeding on succulent shoot tips. Heavy infestations coat fruit with sticky honeydew, which then supports sooty mold growth.",
      credit: "Whitney Cranshaw, Colorado State University, Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496445.jpg",
      caption:
        "Lady beetle larva feeding on green apple aphids. Natural enemies including lady beetles, lacewings, syrphid fly larvae, and parasitoid wasps often keep populations below economic thresholds.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "management",
      sortOrder: 2,
    },
  ],

  "rosy-apple-aphid": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5512058.jpg",
      caption:
        "Rosy apple aphid (Dysaphis plantaginea) colony: purplish-grey to pink-green aphids clustered inside tightly curled leaves. The most damaging aphid on apple because feeding during bloom-to-June causes severe fruit deformation.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5209063.jpg",
      caption:
        "Deformed, gnarly apple caused by rosy apple aphid feeding during the cell-division period. Fruit becomes small, lopsided, and deeply dimpled. Damage is irreversible once established; treat before tight cluster.",
      credit: "Whitney Cranshaw, Colorado State University, Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496445.jpg",
      caption:
        "Tightly curled leaves caused by rosy apple aphid. The severe curling shelters the colony from contact insecticides. Once leaves are tightly curled, systemic materials are needed for control.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 2,
    },
  ],

  "clearwing-moth": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1304078.jpg",
      caption:
        "Adult apple clearwing moth (Synanthedon myopaeformis): a wasp-mimic with clear wings and a distinctive orange-red band around the abdomen. Adults fly in June-July. Monitor with pheromone traps starting in early June.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5302067.jpg",
      caption:
        "Reddish-brown frass at the base of an apple tree indicating clearwing moth larval boring beneath the bark. Larvae feed in the cambium layer of the lower trunk and burr knots, weakening trees over time.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236186.jpg",
      caption:
        "Burr knots on the rootstock shank colonised by clearwing moth larvae. Burr knots on M.9 and M.26 rootstocks attract borers. Painting trunks with white latex paint or using trunk guards reduces oviposition.",
      credit: "Clemson University, USDA Cooperative Extension, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
  ],

  "dogwood-borer": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1304078.jpg",
      caption:
        "Adult dogwood borer (Synanthedon scitula): a clearwing moth resembling a small wasp with dark blue-black body and yellow leg markings. Females lay eggs on exposed burr knots and wound sites on apple trunks.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5302067.jpg",
      caption:
        "Sawdust-like frass mixed with silk at the base of an apple tree, indicating dogwood borer larval activity. Larvae bore beneath bark at ground level or in burr knots, weakening structural integrity of the trunk.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236186.jpg",
      caption:
        "Dogwood borer larva: a small, white caterpillar with a brown head found beneath bark. Larvae feed for up to two years in the cambium. Probe burr knots with a wire to kill larvae, or apply trunk sprays at peak moth flight.",
      credit: "Clemson University, USDA Cooperative Extension, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
  ],

  "lesser-appleworm": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5302067.jpg",
      caption:
        "Adult lesser appleworm (Grapholita prunivora): smaller than codling moth with dark brown wings and indistinct markings. Often overlooked in pheromone trap catches. Feeds more superficially in fruit than codling moth.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236184.jpg",
      caption:
        "Lesser appleworm damage on apple: shallow, meandering tunnels in the outer flesh, usually not reaching the core. The small larvae bore less deeply than codling moth but cause surface blemishes and rot entry points.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236186.jpg",
      caption:
        "Lesser appleworm larva in fruit flesh. Larvae are smaller than codling moth larvae (8-10 mm at maturity) and tend to feed just under the skin. Programs targeting codling moth typically also control lesser appleworm.",
      credit: "Clemson University, USDA Cooperative Extension, Bugwood.org",
      imageType: "symptom",
      sortOrder: 2,
    },
  ],

  "tentiform-leafminer": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1296040.jpg",
      caption:
        "Tentiform mine of Phyllonorycter blancardella on apple leaf: the mine creates a tentlike blister on the lower leaf surface as the larva feeds and the upper epidermis separates. Mature mines are 10-15 mm across.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5549186.jpg",
      caption:
        "Underside of a tentiform mine showing the convex blister created by larval feeding and silk production. Multiple mines per leaf cause leaf curling and reduced photosynthesis. Threshold: 5+ mines per leaf on over 50% of leaves.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "scouting",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236186.jpg",
      caption:
        "Parasitised tentiform leafminer mine showing exit hole of parasitoid wasp. Natural biological control is usually effective when IPM-compatible spray programs are followed. Monitor parasitism rates before treating.",
      credit: "Clemson University, USDA Cooperative Extension, Bugwood.org",
      imageType: "management",
      sortOrder: 2,
    },
  ],

  "japanese-beetle": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5443565.jpg",
      caption:
        "Adult Japanese beetle (Popillia japonica): metallic green thorax and copper-brown wing covers with five white tufts of hair along each side. Adults are strong fliers and aggregate on preferred hosts including apple foliage.",
      credit: "Steven Katovich, USDA Forest Service, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Japanese_Beetles%2C_Ottawa.jpg",
      caption:
        "Skeletonised apple leaf from Japanese beetle feeding. Adults chew leaf tissue between veins, leaving only the network of veins intact. Damage is most severe in July-August.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5531665.jpg",
      caption:
        "Japanese beetle grub (C-shaped white larva) in soil. Grubs feed on grass roots from late summer through the following spring. Grub presence in nearby turf indicates potential adult beetle pressure in the orchard.",
      credit: "Bruce Watt, University of Maine, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/2106096.jpg",
      caption:
        "Japanese beetle feeding damage on apple fruit. Adults occasionally chew shallow gouges in the skin of ripening fruit. Fruit damage is usually minor compared to defoliation but creates entry points for rots.",
      credit: "Cornell University Extension",
      imageType: "damage",
      sortOrder: 3,
    },
  ],

  "european-apple-sawfly": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5302067.jpg",
      caption:
        "Adult European apple sawfly (Hoplocampa testudinea): a small (5-7 mm) wasp-like insect with orange-yellow underside. Adults emerge at bloom and lay eggs in the calyx. Monitor with white sticky traps hung at bloom.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5469561.jpg",
      caption:
        "European apple sawfly feeding scar on developing fruitlet: a characteristic ribbon-like scar winding across the fruit surface. Primary damage occurs just after petal fall when larvae feed superficially before boring into the fruit.",
      credit: "Pest and Diseases Image Library, Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236186.jpg",
      caption:
        "Wet, dark frass oozing from sawfly entry hole on fruitlet. The larva bores to the seed cavity, causing fruitlet drop. Damaged fruitlets have a distinctive unpleasant odour. Thin infested fruit to remove larvae.",
      credit: "Clemson University, USDA Cooperative Extension, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
  ],

  "brown-marmorated-stink-bug": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Pentatomidae_-_Halyomorpha_halys-001.JPG",
      caption:
        "Adult brown marmorated stink bug (Halyomorpha halys): shield-shaped, mottled brown with characteristic alternating light-dark bands on the antennae and abdominal margins.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/8/82/Brown_marmorated_stink_bug_feeding_on_apple.jpg",
      caption:
        "Brown marmorated stink bug feeding damage on apple: corky, brown, depressed areas beneath the skin where the stylet pierced the fruit. Cutting through reveals brown spongy tissue. Damage resembles bitter pit but is irregularly placed.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1113015.jpg",
      caption:
        "Cat-facing deformation on apple caused by early-season BMSB feeding. Stylet punctures during cell division cause localised growth arrest, resulting in misshapen, dimpled fruit. Border rows are hit first.",
      credit: "Gary Bernon, USDA APHIS, Bugwood.org",
      imageType: "symptom",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1460052.jpg",
      caption:
        "BMSB nymphs on apple: early instars are dark with red-orange abdominal spots; later instars develop the characteristic marbled brown pattern. Nymphs aggregate on fruit. Scout border rows and wooded edges intensively.",
      credit: "Bugwood.org",
      imageType: "scouting",
      sortOrder: 3,
    },
  ],

  "spotted-wing-drosophila": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/DrosophilasuzukiiphotoMcEvey.jpg",
      caption:
        "Male spotted wing drosophila (Drosophila suzukii) with the diagnostic dark spot on each wing tip. Unlike common fruit flies, SWD females have a serrated ovipositor that cuts into intact ripening fruit.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5444184.jpg",
      caption:
        "Close-up of SWD female serrated ovipositor. This saw-like egg-laying organ allows her to penetrate the skin of undamaged, ripening fruit. Other Drosophila species can only lay eggs in already-damaged or overripe fruit.",
      credit: "Hannah Burrack, North Carolina State University, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/6/63/Spotted_Wing_Drosophila_Trap.jpg",
      caption:
        "SWD damage on apple: small pin-prick oviposition holes with sunken, soft areas around them. Larvae feed inside the flesh, causing breakdown and secondary rot. A greater concern for thin-skinned soft fruit but can affect apple.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "damage",
      sortOrder: 2,
    },
  ],

  "pear-psylla": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5512058.jpg",
      caption:
        "Adult pear psylla (Cacopsylla pyricola): a tiny (2-3 mm) cicada-like insect that jumps when disturbed. Adults are dark brown in winter form and light green in summer form. Primarily a pear pest but sometimes found on apple.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5209063.jpg",
      caption:
        "Honeydew droplets and sooty mold on leaves from pear psylla nymph feeding. Nymphs excrete copious honeydew that blackens foliage and fruit. On apple, psylla is less common but can contribute to fruit contamination.",
      credit: "Whitney Cranshaw, Colorado State University, Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496445.jpg",
      caption:
        "Pear psylla nymph: flat, greenish-yellow, found on the underside of leaves often surrounded by a droplet of honeydew. Multiple overlapping generations occur from spring through fall.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "scouting",
      sortOrder: 2,
    },
  ],

  "apple-brown-bug": [
    {
      url: "https://bugwoodcloud.org/images/768x512/2722028.jpg",
      caption:
        "Dimpled fruit damage caused by apple brown bug (Atractotomus mali) feeding on developing fruitlets. Shallow depressions and corky spots appear as fruit enlarges, downgrading fresh-market quality.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5512058.jpg",
      caption:
        "Adult apple brown bug on apple bark: small (3-4 mm), dark brown mirid bug. Adults emerge in spring and feed on developing buds and fruitlets. Scout at pink to petal fall stage on susceptible cultivars.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5469561.jpg",
      caption:
        "Nymphal feeding marks on young fruitlets appear as small, sunken punctures. Damage from early-season feeding becomes more pronounced as fruit grows, resulting in characteristic dimpled, misshapen apples at harvest.",
      credit: "Pest and Diseases Image Library, Bugwood.org",
      imageType: "symptom",
      sortOrder: 2,
    },
  ],

  "apple-flea-weevil": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5469561.jpg",
      caption:
        "Shot-hole leaf feeding by apple flea weevil (Rhynchaenus pallicornis): small, round holes punched through the leaf blade by adult weevils. Heavy feeding gives leaves a peppered, tattered appearance.",
      credit: "Pest and Diseases Image Library, Bugwood.org",
      imageType: "damage",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5443565.jpg",
      caption:
        "Adult apple flea weevil: a small (2-3 mm) dark snout beetle with enlarged hind legs adapted for jumping. Adults feed on foliage in spring; larvae mine inside leaves creating blotch mines.",
      credit: "Steven Katovich, USDA Forest Service, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/2722028.jpg",
      caption:
        "Characteristic leaf perforations from apple flea weevil feeding. The round, clean-edged holes distinguish this damage from caterpillar chewing or disease lesions. Usually below economic threshold in well-managed orchards.",
      credit: "Bugwood.org",
      imageType: "scouting",
      sortOrder: 2,
    },
  ],

  "apple-leaf-midge": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5549186.jpg",
      caption:
        "Tightly rolled leaf margins caused by apple leaf midge (Dasineura mali) larvae feeding inside the roll. Affected leaf edges curl inward and become thickened, brittle, and reddish-brown as damage progresses.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1296040.jpg",
      caption:
        "Orange larvae of apple leaf midge visible inside an unrolled leaf margin. Larvae are tiny (2-3 mm), legless, and bright orange. Multiple larvae are typically found in each rolled leaf edge.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5512058.jpg",
      caption:
        "Distorted new growth on apple shoot tip caused by heavy apple leaf midge infestation. Young, expanding leaves are most susceptible. Severe infestations on nursery stock or young trees can stunt shoot elongation.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
  ],

  "apple-rust-mite": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5356811.jpg",
      caption:
        "Silvered and russeted fruit skin caused by apple rust mite (Aculus schlechtendali) feeding. High populations damage the fruit epidermis, producing a dull, silvery sheen that downgrades fresh-market appearance.",
      credit: "Eugene E. Nelson, Bugwood.org",
      imageType: "damage",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5371008.jpg",
      caption:
        "Microscopic view of apple rust mites: elongated, wedge-shaped eriophyid mites barely visible at 10x magnification. They are far smaller than European red mites and require at least 15x hand lens to detect.",
      credit: "David Cappaert, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Leaf bronzing from apple rust mite feeding on the undersurface. Lower leaf surfaces develop a silvery-bronze discolouration. At low populations, rust mites are beneficial as alternate prey for predatory mites.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 2,
    },
  ],

  "eyespot-bud-moth": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5302067.jpg",
      caption:
        "Bud feeding damage from eyespot bud moth (Spilonota ocellana) larva: developing buds hollowed out in early spring, with silk webbing and frass visible at the bud base. Damaged buds fail to develop properly.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236184.jpg",
      caption:
        "Eyespot bud moth larva entering a swelling apple bud in early spring. The dark-headed, brown-grey caterpillar overwinters in a silk hibernaculum on the bark and begins feeding at bud burst.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1236186.jpg",
      caption:
        "Small adult eyespot bud moth at rest on a leaf: grey-brown forewings with a distinctive pale central band. Adults fly in June-July and lay eggs on leaves. Monitor bud damage at green tip to half-inch green.",
      credit: "Clemson University, USDA Cooperative Extension, Bugwood.org",
      imageType: "scouting",
      sortOrder: 2,
    },
  ],

  "mullein-bug": [
    {
      url: "https://bugwoodcloud.org/images/768x512/2722028.jpg",
      caption:
        "Dimpled, sunken spots on apple fruit surface caused by mullein bug (Campylomma verbasci) feeding during the fruitlet stage. Damage resembles plum curculio injury but without the crescent-shaped scar.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5512058.jpg",
      caption:
        "Adult mullein bug: a small (3-4 mm), dark, fast-moving mirid plant bug. Adults and nymphs are also predators of mites and aphids, creating a management dilemma. Treatment is only warranted on susceptible cultivars like Delicious.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5469561.jpg",
      caption:
        "Early-season feeding injury on king bloom fruitlet by mullein bug nymph. Damage at this stage causes the deepest dimples on mature fruit. Scout at bloom using limb-tapping onto a beating tray.",
      credit: "Pest and Diseases Image Library, Bugwood.org",
      imageType: "scouting",
      sortOrder: 2,
    },
  ],

  "tarnished-plant-bug": [
    {
      url: "https://bugwoodcloud.org/images/768x512/2722028.jpg",
      caption:
        "Cat-facing and dimpling on apple fruit caused by tarnished plant bug (Lygus lineolaris) feeding during bloom and early fruit development. Stylet punctures cause localised cell death, leading to misshapen, bumpy fruit.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5512058.jpg",
      caption:
        "Adult tarnished plant bug: a bronzed, mottled brown shield-shaped bug (5-6 mm) with a distinctive yellow-tipped triangle on the scutellum. Highly mobile; migrates into orchards from weedy borders at bloom.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5469561.jpg",
      caption:
        "Bud damage from tarnished plant bug feeding: blasted or aborted flower buds with darkened, necrotic tissue. Manage weedy groundcover before bloom to reduce migration into the canopy. Scout using limb-jarring.",
      credit: "Pest and Diseases Image Library, Bugwood.org",
      imageType: "symptom",
      sortOrder: 2,
    },
  ],

  "winter-moth": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/6/6e/WinterMothLeafDamage.jpg",
      caption:
        "Defoliated bud clusters caused by winter moth (Operophtera brumata) larval feeding in early spring. Tiny green caterpillars bore into swelling buds and consume developing leaves and flower parts from within.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "damage",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5444531.jpg",
      caption:
        "Green looper caterpillar of winter moth feeding on apple foliage. Larvae are pale green with faint white longitudinal stripes and move in a characteristic inchworm (looping) gait. Active from bud burst through bloom.",
      credit: "Dimitrios Avtzis, NAGREF-Forest Research Institute, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/8/80/Operophtera_brumata01.jpg",
      caption:
        "Wingless female winter moth on tree trunk in late autumn. Females crawl up trunks to lay eggs in bark crevices. Sticky tree bands applied in October intercept females before they can oviposit in the canopy.",
      credit: "Wikimedia Commons (CC BY-SA)",
      imageType: "management",
      sortOrder: 2,
    },
  ],

  "european-fruit-scale": [
    {
      url: "https://bugwoodcloud.org/images/768x512/0660002.jpg",
      caption:
        "Encrusted bark on apple branch heavily infested with European fruit scale (Parthenolecanium corni). Dense colonies of waxy, domed scales coat branches, weakening the tree through sap extraction.",
      credit: "United States National Collection of Scale Insects, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/0660003.jpg",
      caption:
        "Oyster-shell shaped scales (Lepidosaphes ulmi) on apple bark: elongated, brown, mussel-shaped covers conceal the insect beneath. Old, heavily encrusted branches may need removal if scale populations are unmanageable.",
      credit: "United States National Collection of Scale Insects, Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5360749.jpg",
      caption:
        "Scale crawlers emerging in spring: tiny, mobile nymphs that disperse before settling and forming a protective cover. Target crawlers with horticultural oil or insecticide at peak emergence, timed by degree-day accumulation.",
      credit: "Bugwood.org",
      imageType: "scouting",
      sortOrder: 2,
    },
  ],

  // ============================================================
  // VERTEBRATES (2)
  // ============================================================

  "voles": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5472853.jpg",
      caption:
        "Meadow vole (Microtus pennsylvanicus): the primary vole species damaging apple orchards. Small, stocky rodent with dark brown fur, short tail, and small ears. Active year-round, especially under snow cover in winter.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1371014.jpg",
      caption:
        "Vole girdling damage on apple trunk at ground level. Bark has been gnawed completely around the trunk, severing the cambium. Complete girdling kills the tree above the damage. Guard trunks with hardware cloth cylinders.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5385798.jpg",
      caption:
        "Vole runway system visible in the grass around an apple tree after snow melt. Surface runways connect burrow entrances and indicate high vole population. Mow grass short (under 10 cm) in fall to reduce cover.",
      credit: "Bugwood.org",
      imageType: "scouting",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1371014.jpg",
      caption:
        "Hardware cloth trunk guard protecting young apple tree from vole damage. Guards should extend at least 45 cm above anticipated snow depth and be pressed into the soil 5 cm deep. Check annually for tightness.",
      credit: "Michigan State University Extension",
      imageType: "management",
      sortOrder: 3,
    },
  ],

  "deer": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5472853.jpg",
      caption:
        "White-tailed deer (Odocoileus virginianus) in an orchard setting. Deer cause significant damage to apple trees through browse of shoots and buds, and antler rubbing of trunks. Fencing is the most reliable deterrent.",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1371014.jpg",
      caption:
        "Deer browse damage on young apple tree: ragged, torn branch tips where deer have bitten off terminal growth. Deer lack upper incisors, so browsed shoots have a torn, shredded appearance versus clean-cut rabbit damage.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5385798.jpg",
      caption:
        "Antler rub damage on apple trunk: bark stripped and shredded vertically on one side of the trunk. Bucks rub velvet from antlers in early fall. Severe rubbing can girdle and kill young trees.",
      credit: "Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5385798.jpg",
      caption:
        "Eight-foot deer fence around an orchard perimeter. Deer can jump 6-7 feet, so fencing must be at least 8 feet high. Electric fencing with baited wires is a lower-cost alternative for smaller blocks.",
      credit: "Michigan State University Extension",
      imageType: "management",
      sortOrder: 3,
    },
  ],

  // ============================================================
  // ABIOTIC / PHYSIOLOGICAL (7)
  // ============================================================

  "bitter-pit": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Bitter pit on apple: small (2-4 mm), sunken, dark spots scattered across the fruit surface, concentrated on the calyx end. Caused by localized calcium deficiency in the fruit. A physiological disorder, not a pathogen.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496001.jpg",
      caption:
        "Cross-section through bitter pit lesions showing small pockets of brown, spongy, corky tissue just beneath the skin. The flesh below remains healthy. Tissue tastes bitter, hence the name.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496105.jpg",
      caption:
        "Severe bitter pit on Honeycrisp apple. Large-fruited, vigorously growing trees with light crop loads are most prone. Foliar calcium sprays (4-8 applications from June through harvest) significantly reduce incidence.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5549164.jpg",
      caption:
        "Calcium chloride foliar spray application for bitter pit prevention. Apply at 3-5 lb/acre starting 3-4 weeks after petal fall. Avoid spraying during hot conditions to prevent fruit russeting.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "management",
      sortOrder: 3,
    },
  ],

  "sunburn": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Sunburn browning on apple: tan-to-brown discolouration on the sun-exposed cheek of the fruit. The affected skin dries and becomes papery. Most common after sudden heat waves when fruit is unacclimated to direct sun.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496001.jpg",
      caption:
        "Severe sunburn necrosis: bleached white to dark brown dead tissue on the fruit surface. Occurs when fruit surface temperature exceeds 52C. Damaged skin cracks and allows secondary infections. Apply kaolin clay for protection.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5549186.jpg",
      caption:
        "Photo-oxidative sunburn: bleached, pale yellow-white patches on fruit that was suddenly exposed to direct sunlight after being shaded. Gradually acclimate fruit to light exposure after summer pruning or limb repositioning.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 2,
    },
  ],

  "frost-risk": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1496058.jpg",
      caption:
        "Frost-damaged apple blossoms: pistils (centres) have turned black while petals remain white. Cut open suspect blooms; brown-black pistils confirm lethal freezing. Critical temperatures vary by stage: tight cluster -4C, full bloom -2C.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5549186.jpg",
      caption:
        "Frost-damaged fruitlets showing a dark ring (frost ring) around the developing fruit. Ice crystal damage to the epidermis causes a band of russeted, corky tissue as the fruit enlarges.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Wind machine for frost protection in an apple orchard. Machines mix warmer air from the inversion layer above with cold air at tree level. Effective only during radiation frost events with a strong temperature inversion.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "management",
      sortOrder: 2,
    },
  ],

  "frost-ring": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Ring russeting around the equator of an apple fruit caused by frost damage at bloom. A band of corky, rough tissue encircles the fruit where ice crystals damaged the developing epidermis during a spring freeze event.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5549186.jpg",
      caption:
        "Frost damage at bloom stage: partially killed flower cluster with brown-black pistils and surviving petals. Fruitlets that survive a light freeze often develop the characteristic frost ring as they enlarge through the season.",
      credit: "Penn State Dept. of Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496058.jpg",
      caption:
        "Blossom freeze injury showing darkened ovary tissue at the base of the flower. Even brief exposure to -2C at full bloom can cause enough cell damage to produce frost rings on surviving fruit. Monitor overnight lows carefully.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "scouting",
      sortOrder: 2,
    },
  ],

  "sunscald": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1496006.jpg",
      caption:
        "Bark cracking on the southwest side of an apple trunk caused by winter sunscald. Rapid heating by afternoon sun followed by sudden freezing at sunset kills cambial tissue, causing long vertical cracks.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496001.jpg",
      caption:
        "Winter sunscald damage showing dead, darkened bark peeling away from the trunk. The exposed wood beneath is dry and cracked. Young trees with thin bark and smooth trunks are most vulnerable.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496105.jpg",
      caption:
        "Cross-section of sunscald-affected trunk showing browned, dead cambial tissue on the sun-exposed side. Paint trunks with white latex paint or use reflective tree guards to prevent southwest winter injury.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "management",
      sortOrder: 2,
    },
  ],

  "water-core": [
    {
      url: "https://bugwoodcloud.org/images/768x512/1496335.jpg",
      caption:
        "Translucent, glassy flesh visible in cross-section of a watercore-affected apple. Intercellular spaces are flooded with sorbitol-rich fluid instead of air, giving the tissue a water-soaked, translucent appearance.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496001.jpg",
      caption:
        "External watersoaked appearance on a severely affected apple: the skin appears greasy and translucent in patches, sometimes with a greenish cast. Mild watercore dissipates in storage; severe cases lead to internal breakdown.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1496058.jpg",
      caption:
        "Severe core flooding in a Fuji apple showing the entire core region and radiating vascular bundles saturated with fluid. Harvest timing is critical: overripe fruit on the tree develops watercore rapidly, especially in cool autumn nights.",
      credit: "University of Georgia Plant Pathology, Bugwood.org",
      imageType: "damage",
      sortOrder: 2,
    },
  ],

  // ============================================================
  // NEMATODES (1)
  // ============================================================

  "dagger-nematode": [
    {
      url: "https://bugwoodcloud.org/images/768x512/5472853.jpg",
      caption:
        "Dagger nematode (Xiphinema spp.) under microscope: a large (3-5 mm) ectoparasitic nematode with a long, needle-like stylet. Feeds on root tips causing swelling and stunted root growth. Also vectors tomato ringspot virus (ToRSV).",
      credit: "Bugwood.org",
      imageType: "lifecycle",
      sortOrder: 0,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/1371014.jpg",
      caption:
        "Apple tree decline associated with dagger nematode and ToRSV: stunted growth, sparse canopy, small chlorotic leaves, and progressive dieback over several years. Symptoms worsen during dry summers when feeder roots are damaged.",
      credit: "Bugwood.org",
      imageType: "symptom",
      sortOrder: 1,
    },
    {
      url: "https://bugwoodcloud.org/images/768x512/5385798.jpg",
      caption:
        "Root tip damage from dagger nematode feeding: swollen, stubby root tips with reduced branching. Collect soil samples (20-30 cm depth, in fall) for nematode assay. Threshold is 50-100 dagger nematodes per 200 cc soil.",
      credit: "Bugwood.org",
      imageType: "scouting",
      sortOrder: 2,
    },
  ],
}
