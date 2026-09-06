const IMG = "https://static.prod-images.emergentagent.com/jobs/c0491736-3096-426b-960f-5b5a7123e01c/images";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export const IMAGES = {
  hero: `${IMG}/2647933899e02e35d7b1dbc758eceee2254b4fd0987c42be0ff3e10a4af65c57.jpeg`,
  findusHero: `${IMG}/3ab78a9f6a02de8f05c27b8c9d97e3d298a7f0706d6c61c9e84c92e330c5f50d.jpeg`,
  story: `${IMG}/c8d64aef12566e1f212eab24b019956854051c9bf5bc7f0702c1fda4b181ec79.jpeg`,
  woman: `${IMG}/fc983030661adb3973a4eaf188d34f4ad4892539a4db352cc904db35ad1afa95.jpeg`,
  gift: `${IMG}/9b27de75b25c48f25d043bab105ee5e8a2f3498f7b8b8c5af6681aa9ffda1ec2.jpeg`,
  couple: `${IMG}/28af35583dc0379b5f6b5409586652569bb3de3fd1ae76a2cb22ad5b8b3dcb6f.jpeg`,
  notes: `${IMG}/79ce7971d9755f6b2a36fec0c8aba54160ab7cc26db0c09b361e109c972c9699.jpeg`,
  street: `${IMG}/2c36d3d9c7b201f45479f476f850cda8ac4d644d8efd7add6a119df2b11b7144.jpeg`,
  bridge: `${IMG}/e10a4cc03cc9f577df22ff0d7837063b26412fc3eaa41961057350fb12186c18.jpeg`,
};

export type Category = "coffee" | "flowers" | "combo" | "seasonal";

export interface Product {
  id: string;
  num: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  alt: string;
}

export const PRODUCTS: Product[] = [
  { id: "lovely-latte", num: "01", name: "Lovely Latte", description: "Classic latte with a little flower", price: 5.5, category: "coffee", image: `${IMG}/4f08ea54444d4729e03160549a3332565446d3a7538a47164b1c324a9607e48f.jpeg`, alt: "Iced latte with a pink carnation posy tied with twine" },
  { id: "bloom-cappuccino", num: "02", name: "Bloom Cappuccino", description: "Cappuccino with a mini bouquet", price: 5.0, category: "coffee", image: `${IMG}/f0d6d48451529c7a61008304b8992ca968bc2924db3b51e81f3e5fb0e3cc736a.jpeg`, alt: "Cappuccino with heart latte art and a baby's breath posy" },
  { id: "pink-bloom-latte", num: "03", name: "Pink Bloom Latte", description: "Iced latte with floral touch", price: 5.8, category: "coffee", image: `${IMG}/22c05cf7205d2c46119d722483999512a2699195dc24f13be0d6cfce1bcade82.jpeg`, alt: "Iced pink latte with a pink daisy posy" },
  { id: "flowers-cup", num: "04", name: "Flowers Cup", description: "Seasonal fresh flowers in a cup", price: 12.0, category: "flowers", image: `${IMG}/0b980d0c68ed75d2f70bfabbbf017ff9640e4b2a65d2cae7e950c3997616363c.jpeg`, alt: "White cup filled with fresh pink tulips and daisies" },
  { id: "matcha-moment", num: "05", name: "Matcha Moment", description: "Matcha latte with a mini bouquet", price: 5.8, category: "coffee", image: `${IMG}/4a2ecba94a5256dc8af79f9df6a74f4dbbe8ba63d034c4e540efe41397c700af.jpeg`, alt: "Matcha latte with a white daisy posy tied with twine" },
  { id: "the-perfect-pair", num: "06", name: "The Perfect Pair", description: "Your coffee and a cup of flowers", price: 15.0, category: "combo", image: `${IMG}/c0d66cce7b34b7d47090c333efa448aee09eacb4e9df642c18dd60cbb8e41e66.jpeg`, alt: "Drink carrier holding an iced coffee and a small cup of pink flowers" },
  { id: "caramel-bloom", num: "07", name: "Caramel Bloom", description: "Iced caramel latte with a mini bouquet", price: 5.8, category: "coffee", image: `${IMG}/e0d1a3c9c127b471d39c0c4b424004878b799236b6b2e4cae06f88684605e286.jpeg`, alt: "Iced caramel latte with a baby's breath posy" },
  { id: "blue-harmony", num: "08", name: "Blue Harmony", description: "Seasonal fresh flowers in a cup", price: 12.0, category: "flowers", image: `${IMG}/afd59e67ad0afefd9ae25b7a5086011cc0260c44914ee8449de924727a000245.jpeg`, alt: "Cup vase with blue delphinium and white daisies" },
  { id: "mocha-love", num: "09", name: "Mocha Love", description: "Mocha with a mini bouquet", price: 5.8, category: "coffee", image: `${IMG}/fd4caf90d9ac521ce258213ae9ccf74958ebd4926732d56a3e11179df666a535.jpeg`, alt: "Pink ceramic cup of mocha with a pink astilbe posy" },
  { id: "berry-blossom", num: "10", name: "Berry Blossom", description: "Iced berry latte with a mini bouquet", price: 5.8, category: "seasonal", image: `${IMG}/cf722d88cf332f52010da5a6ea8b712532e03adfa3abf6a2866b9969214732ef.jpeg`, alt: "Iced berry latte with a pink daisy posy" },
];

export const gbp = (n: number) => `£${n.toFixed(2)}`;

export const INSTAGRAM_URL = "https://instagram.com/bloomandbrew";
export const TIKTOK_URL = "https://tiktok.com/@bloomandbrew";
export const PINTEREST_URL = "https://pinterest.com/bloomandbrew";
export const DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1&destination=Tower+Bridge,+London+SE1+2UP";

export type MilkStock = Record<string, boolean>;

export interface CatalogProduct extends Product {
  in_stock?: boolean;
}

export function useCatalog(): { products: CatalogProduct[]; milkStock: MilkStock } {
  const productsQuery = useQuery({
    queryKey: ["catalog-products"],
    queryFn: () => apiGet<{ products: CatalogProduct[] }>("/products"),
    staleTime: 30000,
    retry: false,
  });
  const settingsQuery = useQuery({
    queryKey: ["catalog-settings"],
    queryFn: () => apiGet<{ milk_stock: MilkStock }>("/settings/public"),
    staleTime: 30000,
    retry: false,
  });
  const products =
    productsQuery.data && productsQuery.data.products.length > 0
      ? productsQuery.data.products
      : PRODUCTS.map((p) => ({ ...p, in_stock: true }));
  const milkStock = settingsQuery.data?.milk_stock ?? { whole: true, oat: true, almond: true, soy: true };
  return { products, milkStock };
}

