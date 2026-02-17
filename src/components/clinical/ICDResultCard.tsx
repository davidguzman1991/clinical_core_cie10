import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";

type ICDResultCardProps = {
  code: string;
  diagnosisName: string;
  shortDescription: string;
  copied: boolean;
  isFavorite: boolean;
  isSelected: boolean;
  onCopy: (code: string) => void;
  onSelect: (code: string) => void;
  onToggleFavorite: (code: string) => void;
};

export default function ICDResultCard({
  code,
  diagnosisName,
  shortDescription,
  copied,
  isFavorite,
  isSelected,
  onCopy,
  onSelect,
  onToggleFavorite,
}: ICDResultCardProps) {
  return (
    <Card className="group relative overflow-hidden border-white/35 bg-gradient-to-br from-white/90 via-cyan-50/65 to-slate-100/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-24px_rgba(8,145,178,0.65)] focus-within:ring-2 focus-within:ring-cyan-500/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_45%)]" />

      <CardHeader className="relative pb-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <Badge className="text-sm tracking-[0.22em]">{code}</Badge>

          <Tooltip content={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(code)}
              aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              aria-pressed={isFavorite}
              className="h-9 w-9 rounded-full text-cyan-700 hover:bg-cyan-100"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {isFavorite ? "★" : "☆"}
              </span>
            </Button>
          </Tooltip>
        </div>

        <CardTitle className="line-clamp-2 text-balance text-[1.02rem] text-slate-900">
          {diagnosisName}
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm leading-relaxed text-slate-600">
          {shortDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative" />

      <CardFooter className="relative flex flex-wrap gap-2">
        <Tooltip content={copied ? "Copiado" : "Copiar ICD10"}>
          <Button
            variant="outline"
            className="flex-1 min-w-[10rem]"
            onClick={() => onCopy(code)}
            aria-live="polite"
          >
            <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
            <span>{copied ? "Copiado" : "Copy ICD10"}</span>
          </Button>
        </Tooltip>

        <Button
          className="flex-1 min-w-[10rem]"
          onClick={() => onSelect(code)}
          aria-pressed={isSelected}
        >
          <span aria-hidden="true">{isSelected ? "✓" : "↳"}</span>
          <span>{isSelected ? "Seleccionado" : "Select ICD10"}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
