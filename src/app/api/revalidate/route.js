import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  const secret = request.headers.get("x-revalidation-secret");
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const revalidated = [];

    // Support explicit paths
    if (body.paths && Array.isArray(body.paths)) {
      for (const path of body.paths) {
        revalidatePath(path);
        revalidated.push(path);
      }
    }

    // Support type + slug shorthand
    if (body.type && body.slug) {
      if (body.type === "gym") {
        revalidatePath(`/gym/${body.slug}/`);
        revalidated.push(`/gym/${body.slug}/`);

        // Also revalidate the city page if city_slug is provided
        if (body.city_slug) {
          revalidatePath(`/best-gyms/${body.city_slug}/`);
          revalidated.push(`/best-gyms/${body.city_slug}/`);
        }

        // Always revalidate the index
        revalidatePath("/best-gyms/");
        revalidated.push("/best-gyms/");
      }

      if (body.type === "city") {
        revalidatePath(`/best-gyms/${body.slug}/`);
        revalidatePath(`/compare/${body.slug}/`);
        revalidatePath("/best-gyms/");
        revalidated.push(`/best-gyms/${body.slug}/`, `/compare/${body.slug}/`, "/best-gyms/");
      }
    }

    // Support Supabase webhook format (table + record)
    if (body.table && body.record) {
      if (body.table === "gyms") {
        const slug = body.record.slug;
        const citySlug = body.record.city_slug;
        if (slug) {
          revalidatePath(`/gym/${slug}/`);
          revalidated.push(`/gym/${slug}/`);
        }
        if (citySlug) {
          revalidatePath(`/best-gyms/${citySlug}/`);
          revalidatePath(`/compare/${citySlug}/`);
          revalidated.push(`/best-gyms/${citySlug}/`, `/compare/${citySlug}/`);
        }
        revalidatePath("/best-gyms/");
        revalidated.push("/best-gyms/");
      }

      if (body.table === "cities") {
        const slug = body.record.slug;
        if (slug) {
          revalidatePath(`/best-gyms/${slug}/`);
          revalidatePath(`/compare/${slug}/`);
          revalidated.push(`/best-gyms/${slug}/`, `/compare/${slug}/`);
        }
        revalidatePath("/best-gyms/");
        revalidated.push("/best-gyms/");
      }
    }

    return NextResponse.json({ revalidated, success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
