import React from "react"

interface ProductFeaturesProps {
  shortDescription: string
}

export default function ProductFeatures({ shortDescription }: ProductFeaturesProps) {
  // If no short description, don't render anything
  if (!shortDescription || shortDescription.trim() === '') {
    return null
  }

  return (
    <section className="mt-6 pb-6 border-b border-secondary-100">
      <h2 className="text-xl font-semibold mb-4">
        Features & Details
      </h2>
      <div
        className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: shortDescription }}
      />
    </section>
  )
}
