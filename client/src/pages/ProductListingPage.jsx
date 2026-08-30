import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import CategorySidebar from '../components/CategorySidebar';
import ProductCard from '../components/ProductCard';

const ProductListingPage = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const keyword = searchParams.get('keyword') || '';
  const flash = searchParams.get('flash') === 'true';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const params = { pageNumber: page, pageSize: 9 };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (flash) params.flash = true;
    if (sort) params[sort] = true;

    api.getProducts(params).then((data) => {
      setProducts(data.products);
      setPages(data.pages);
    }).catch(() => {});
  }, [category, keyword, flash, sort, page]);

  const setSort = (value) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set('sort', value);
    else params.delete('sort');
    navigate(`${window.location.pathname}?${params.toString()}`);
  };

  const title = flash ? 'Flash Deals' : keyword ? `Search: "${keyword}"` : category ? category : 'All Products';

  return (
    <main className="flex flex-1 w-full px-3 md:px-6 lg:px-8 pr-4 md:pr-margin-desktop py-6 gap-6">
      <CategorySidebar categories={categories} activeCategory={category} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-on-surface-variant mb-4 items-center gap-1.5 flex-wrap">
          <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/')}>Home</span>
          <span className="material-symbols-outlined text-sm text-on-surface-variant/50">chevron_right</span>
          <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/shop')}>Shop</span>
          {category && (
            <>
              <span className="material-symbols-outlined text-sm text-on-surface-variant/50">chevron_right</span>
              <span className="text-primary font-semibold">{category}</span>
            </>
          )}
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface leading-tight">{title}</h1>
            {keyword && (
              <p className="text-sm text-on-surface-variant mt-1">
                Showing results for &ldquo;{keyword}&rdquo;
              </p>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-surface-container-low text-on-surface text-sm rounded-lg px-4 py-2.5 border border-surface-container font-medium outline-none focus:border-primary-container transition-colors cursor-pointer"
          >
            <option value="">Sort by: Featured</option>
            <option value="lowest">Price: Low to High</option>
            <option value="highest">Price: High to Low</option>
          </select>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-surface-container/60">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">search_off</span>
            <h2 className="text-lg font-bold text-on-surface mt-4">No products found</h2>
            <p className="text-sm text-on-surface-variant mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
                  p === page
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'border border-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProductListingPage;
