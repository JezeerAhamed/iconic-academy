import Script from 'next/script';

type JsonLdProps = {
  id: string;
  schema: Record<string, unknown>;
};

export default function JsonLd({ id, schema }: JsonLdProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
