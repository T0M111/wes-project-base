import { getProducts } from "@/lib/handlers";
import ProductTile from "@/components/ProductTile";

export default async function Index() {
  const data = await getProducts();

  return (
    <div className="flex flex-col px-6 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Our Products</h1>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {data.products.map((product) => (
          <ProductTile key={product._id.toString()} product={product} />
        ))}
      </div>
    </div>
  );
}