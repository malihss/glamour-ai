'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { adminApi } from '@/lib/adminApi'
import { ProductForm, ProductFormValues } from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [initialValues, setInitialValues] = useState<ProductFormValues | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getProduct(id)
      .then(data => {
        const p = data.product ?? data
        setInitialValues({
          name:             p.name             ?? '',
          shortDescription: p.shortDescription ?? '',
          description:      p.description      ?? '',
          price:            p.price != null    ? String(p.price) : '',
          compareAtPrice:   p.compareAtPrice != null ? String(p.compareAtPrice) : '',
          stockQuantity:    p.stockQuantity != null  ? String(p.stockQuantity)  : '0',
          sku:              p.sku ?? '',
          categoryId:       p.category?.id != null ? String(p.category.id) : '',
          brandId:          p.brand?.id != null     ? String(p.brand.id)   : '',
          primaryImage:     p.primaryImage ?? '',
          isFeatured:       p.isFeatured ?? false,
          isActive:         p.isActive   ?? true,
          tags:             p.tags ?? [],
          fragranceNotes: {
            top:      p.notes_top         ?? [],
            middle:   p.notes_middle      ?? [],
            base:     p.notes_base        ?? [],
            longevity: p.longevity        ?? '',
            sillage:   p.sillage          ?? '',
            gender:    p.gender           ?? '',
            family:    p.fragrance_family ?? '',
          },
        })
      })
      .catch(() => {
        toast.error('Failed to load product')
        router.push('/admin/products')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (values: ProductFormValues) => {
    await adminApi.updateProduct(id, {
      name:             values.name.trim(),
      shortDescription: values.shortDescription,
      description:      values.description,
      price:            parseFloat(values.price),
      compareAtPrice:   values.compareAtPrice ? parseFloat(values.compareAtPrice) : null,
      stock:            parseInt(values.stockQuantity) || 0,
      sku:              values.sku.trim() || null,
      imageUrl:         values.primaryImage.trim() || '',
      isFeatured:       values.isFeatured,
      isActive:         values.isActive,
      categoryId:       values.categoryId ? parseInt(values.categoryId) : null,
      brandId:          values.brandId    ? parseInt(values.brandId)    : null,
      tags:             values.tags,
      fragranceNotes:   values.fragranceNotes,
    })
    toast.success('Product updated!')
    router.push('/admin/products')
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/products"
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-0.5">Catalog</p>
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <ProductForm
      productId={id}
      initialValues={initialValues}
      title="Edit Product"
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
    />
  )
}
