import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F5FAF9] text-[#123C3A]">
      {/* Header */}
      <header className="border-b border-[#E7EDE9] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            ErgoSpace
          </Link>

          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/" className="hover:text-[#D99A55]">Home</Link>
            <Link href="/products" className="hover:text-[#D99A55]">Products</Link>
            <Link href="/compare" className="hover:text-[#D99A55]">Compare</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <p className="mb-4 font-semibold uppercase tracking-[0.2em] text-[#2E7770]">
          About ErgoSpace
        </p>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
          Better comfort.
          <br />
          Better workspace.
          <br />
          <span className="text-[#2E7770]">Better workdays.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          We believe your workspace should support the way you work.
          ErgoSpace brings thoughtful ergonomic products together to help
          you create a comfortable and productive workspace.
        </p>

        <Link
          href="/products"
          className="mt-8 inline-block rounded-full bg-[#123C3A] px-8 py-3 font-semibold text-white transition hover:bg-[#2E7770]"
        >
          Explore Products →
        </Link>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="rounded-3xl bg-[#E7EDE9] p-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#2E7770]">
              Our Story
            </p>
            <h2 className="mt-4 text-3xl font-bold">
              Small changes make a big difference.
            </h2>
            <p className="mt-5 leading-8 text-gray-600">
              Hours at a desk can make workspace comfort an important part
              of everyday life. We created ErgoSpace to make ergonomic
              essentials easier to discover, understand and choose.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="mt-5 leading-8 text-gray-600">
              Our mission is to make workspace comfort accessible through
              thoughtfully selected desk accessories and ergonomic products.
              We want to help people build workspaces that feel more
              comfortable, organized and supportive.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-semibold uppercase tracking-widest text-[#2E7770]">
              What We Offer
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Essentials for your workspace
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Laptop Stands",
                desc: "Support a more comfortable screen position.",
              },
              {
                name: "Ergonomic Chairs",
                desc: "Seating designed with comfort and support in mind.",
              },
              {
                name: "Desk Accessories",
                desc: "Keep your workspace organized and functional.",
              },
              {
                name: "Mouse & Wrist Support",
                desc: "Everyday accessories for your desk setup.",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-[#E7EDE9] bg-[#F5FAF9] p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="mt-3 leading-7 text-gray-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold">
          Why ErgoSpace?
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Comfort Focused",
              desc: "Products selected with workspace comfort in mind.",
            },
            {
              title: "Thoughtfully Selected",
              desc: "Useful essentials for everyday desk setups.",
            },
            {
              title: "Simple Shopping",
              desc: "Explore products, compare options and shop easily.",
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="mt-3 leading-7 text-gray-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl bg-[#123C3A] px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">
            Build your better workspace.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/80">
            Discover ergonomic essentials designed to make your everyday
            workspace more comfortable.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-block rounded-full bg-[#D99A55] px-8 py-3 font-semibold text-[#123C3A] hover:bg-[#e8b273]"
          >
            Shop Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E7EDE9] bg-white px-6 py-8 text-center">
        <p className="text-xl font-bold">ErgoSpace</p>
        <p className="mt-2 text-sm text-gray-500">
          Build a comfortable workspace. Make every workday better.
        </p>
        <p className="mt-5 text-xs text-gray-400">
          © 2026 ErgoSpace. All rights reserved.
        </p>
      </footer>
    </main>
  );
}