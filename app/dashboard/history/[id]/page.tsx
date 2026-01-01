import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getSupabaseAdmin } from "../../../../server/supabase-admin";
import RentalDetail from "../../../../components/RentalDetail";

// Prevent serving stale empty lists - force dynamic rendering
export const dynamic = "force-dynamic";

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

// Database row uses uploaded_at, UI expects created_at
type PhotoDbRow = {
  id: string;
  storage_path: string;
  sha256: string | null;
  uploaded_at: string;
  kind: string | null;
};

export type PhotoRow = {
  id: string;
  storage_path: string;
  sha256: string | null;
  created_at: string; // Mapped from uploaded_at for UI compatibility
  kind: string | null;
  signedUrl?: string;
  signedUrlError?: boolean;
  errorMessage?: string;
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

  // Fetch photos for this rental from the photos table using Service Role to bypass RLS
  const supabaseAdmin = getSupabaseAdmin();

  // Track any errors during photo fetching
  let photosError: string | null = null;
  let photosData: PhotoDbRow[] | null = null;

  try {
    // Select uploaded_at (the real column) instead of created_at
    const photoResponse = await supabaseAdmin
      .from("photos")
      .select("id, storage_path, sha256, uploaded_at, kind")
      .eq("rental_id", id)
      .order("uploaded_at", { ascending: true });

    if (photoResponse.error) {
      console.error("Failed to fetch photos:", photoResponse.error);
      photosError = `Failed to fetch photos: ${photoResponse.error.message}`;
    } else {
      photosData = photoResponse.data as PhotoDbRow[] | null;
    }
  } catch (err) {
    console.error("Photo fetch crashed:", err);
    photosError = `Photo fetch error: ${err instanceof Error ? err.message : "Unknown error"}`;
  }

  // Generate signed URLs for each photo with error handling
  const photos: PhotoRow[] = [];
  if (photosData && photosData.length > 0) {
    for (const photo of photosData) {
      // Map uploaded_at to created_at for UI compatibility
      const photoRow: PhotoRow = {
        id: photo.id,
        storage_path: photo.storage_path,
        sha256: photo.sha256,
        created_at: photo.uploaded_at, // Map uploaded_at -> created_at
        kind: photo.kind,
        signedUrl: undefined,
        signedUrlError: false,
        errorMessage: undefined,
      };

      // Wrap signed URL generation in try/catch
      try {
        const { data: signedData, error: signError } = await supabaseAdmin.storage
          .from("evidence")
          .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry

        if (signError) {
          console.error(`Failed to sign URL for ${photo.storage_path}:`, signError);
          photoRow.signedUrlError = true;
          photoRow.errorMessage = signError.message;
        } else {
          photoRow.signedUrl = signedData?.signedUrl;
        }
      } catch (signErr) {
        console.error(`Signed URL generation crashed for ${photo.storage_path}:`, signErr);
        photoRow.signedUrlError = true;
        photoRow.errorMessage = signErr instanceof Error ? signErr.message : "Signing failed";
      }

      photos.push(photoRow);
    }
  }

  // Generate signed URL for condition_image_url if it exists and is a storage path
  let conditionImageUrl: string | null = rental.condition_image_url ?? null;
  if (conditionImageUrl) {
    const isStoragePath = !/^https?:\/\//i.test(conditionImageUrl);
    if (isStoragePath) {
      try {
        const { data: conditionSignedData, error: conditionSignError } = await supabaseAdmin.storage
          .from("evidence")
          .createSignedUrl(conditionImageUrl, 3600); // 1 hour expiry

        if (conditionSignError) {
          console.error("Failed to sign condition image URL:", conditionSignError);
          conditionImageUrl = null;
        } else {
          conditionImageUrl = conditionSignedData?.signedUrl ?? null;
        }
      } catch (err) {
        console.error("Condition image URL signing crashed:", err);
        conditionImageUrl = null;
      }
    }
  }

  // Pass signed URL instead of raw path for condition image
  const rentalWithSignedUrl = {
    ...rental,
    condition_image_url: conditionImageUrl,
  };

  console.log("Rental ID:", id, "Photos Found:", photosData?.length ?? 0);

  return (
    <RentalDetail
      rental={rentalWithSignedUrl as Rental}
      photos={photos}
      photosError={photosError}
    />
  );
}
