'use client'

import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/adminApi'
import { ProductForm, ProductFormValues } from '@/components/admin/ProductForm'
import toast from 'react-hot-toast'

export default function NewProductPage() {
  const router = useRouter()

  const handleSubmit = async (values: ProductFormValues) => {
    await adminApi.createProduct({
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
    toast.success('Product created!')
    router.push('/admin/products')
  }

  return (
    <ProductForm
      title="New Product"
      submitLabel="Create Product"
      onSubmit={handleSubmit}
    />
  )
}
