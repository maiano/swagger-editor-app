import { getUser } from "@/shared/lib/supabase/utils";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { LogoutButton } from "../logout-button/LogoutButton";

export default async function HeaderContent() {
  const user = await getUser();

  return (
    <div className="container mx-auto flex h-16 items-center justify-between px-4">
      <Link href="/" className="text-xl font-semibold">
        Swagger/OpenAPI UI
      </Link>
      <div className="flex items-center gap-3">
        <Suspense>
          {!user && (
            <>
              <Button>
                <Link href="/sign-in">Sign in</Link>
              </Button>

              <Button>
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </Suspense>

        <Suspense>
          {user && (
            <>
              <Button>
                <Link href="/history">History</Link>
              </Button>
              <LogoutButton />
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
}
