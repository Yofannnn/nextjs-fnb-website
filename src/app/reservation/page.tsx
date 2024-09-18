import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Reservation() {
  return (
    <>
      <div>
        <h1>Reservation</h1>
        <div>
          <Button>
            <Link href="/reservation/table-only">Reservation Table Only</Link>
          </Button>
          <Button>
            <Link href="/reservation/include-food">
              Reservation Include Food
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
