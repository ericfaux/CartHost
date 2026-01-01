import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getSupabaseAdmin } from "../../../../server/supabase-admin";
import RentalDetail from "../../../../components/RentalDetail";

type Rental = {
  id: string;
  created_at: string;
  guest_name?: string | null;
  status?: string | null;
  waiver_agreed?: boolean | null;
  waiver_agreed_at?: string | null;
  guest_ip?: string | null;
  user_agent?: string | null;
  waiver_version?: string | null;
  condition_comment?: string | null;
  condition_image_url?: string | null;
  carts?: {
    name?: string | null;
  } | null;
};

type PhotoDbRow = {
  id: string;
  storage_path: string;
  sha256: string | null;
  created_at: string;
};

export type PhotoRow = PhotoDbRow & {
  signedUrl?: string;
};

export default async function RentalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore set errors during server rendering when cookies cannot be set
          }
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login");
  }

  // --- THE FIX IS HERE ---
  const { data: rental, error } = await supabase
    .from("rentals")
    // 1. Use !inner to ensure the cart relation exists and matches filters
    .select("*, carts!inner(name, host_id)")
    .eq("id", id)
    // 2. Filter against the joined cart's host_id
    .eq("carts.host_id", user.id)
    .single();
  // -----------------------

  if (!rental || error) {
    // This handles cases where the rental doesn't exist OR belongs to another host
    notFound();
  }

  // Fetch photos for this rental from the photos table
  const supabaseAdmin = getSupabaseAdmin();
  const { data: photosData } = (await supabaseAdmin
    .from("photos")
    .select("id, storage_path, sha256, created_at")
    .eq("rental_id", id)
    .order("created_at", { ascending: true })) as { data: PhotoDbRow[] | null };

  // Generate signed URLs for each photo
  const photos: PhotoRow[] = [];
  if (photosData && photosData.length > 0) {
    for (const photo of photosData) {
      const { data: signedData } = await supabaseAdmin.storage
        .from("evidence")
        .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry

      photos.push({
        id: photo.id,
        storage_path: photo.storage_path,
        sha256: photo.sha256,
        created_at: photo.created_at,
        signedUrl: signedData?.signedUrl,
      });
    }
  }

  // Generate signed URL for condition_image_url if it exists and is a storage path
  let conditionImageUrl: string | null = rental.condition_image_url ?? null;
  if (conditionImageUrl) {
    const isStoragePath = !/^https?:\/\//i.test(conditionImageUrl);
    if (isStoragePath) {
      const { data: conditionSignedData } = await supabaseAdmin.storage
        .from("evidence")
        .createSignedUrl(conditionImageUrl, 3600); // 1 hour expiry
      conditionImageUrl = conditionSignedData?.signedUrl ?? null;
    }
  }

  // Pass signed URL instead of raw path for condition image
  const rentalWithSignedUrl = {
    ...rental,
    condition_image_url: conditionImageUrl,
  };

  console.log("Rental ID:", id, "Photos Found:", photosData?.length ?? 0);

  return <RentalDetail rental={rentalWithSignedUrl as Rental} photos={photos} />;
}
