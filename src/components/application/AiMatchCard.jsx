import { Brain, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useAiMatch } from "../../context/AiMatchContext";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { LoadingSpinner } from "../ui/LoadingSpinner";

export const AiMatchCard = ({ applicationId }) => {
  const { getMatchAnalysis, refreshMatchAnalysis } = useAiMatch();
  const [localLoading, setLocalLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const loadAnalysis = async () => {
    if (!applicationId) return;
    setLocalLoading(true);
    try {
      const result = await getMatchAnalysis(applicationId);
      setAnalysis(result);
    } catch (err) {
      console.error("Failed to load analysis:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (!applicationId) return;
    const fetchAnalysis = async () => {
      setLocalLoading(true);
      try {
        const result = await getMatchAnalysis(applicationId);
        setAnalysis(result);
      } catch (err) {
        console.error("Failed to load analysis:", err);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchAnalysis();
  }, [applicationId, getMatchAnalysis]);

  const handleRefresh = async () => {
    setLocalLoading(true);
    try {
      const result = await refreshMatchAnalysis(applicationId);
      setAnalysis(result);
    } catch (err) {
      console.error("Failed to refresh:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-blue-600";
    if (score >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 70) return "bg-green-50";
    if (score >= 50) return "bg-blue-50";
    if (score >= 30) return "bg-yellow-50";
    return "bg-red-50";
  };

  if (localLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
          <span className="ml-3 text-gray-600">Analyzing compatibility...</span>
        </CardBody>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No analysis available</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalysis}
            className="mt-3"
          >
            Analyze Now
          </Button>
        </CardBody>
      </Card>
    );
  }

  const { finalScore, score, pros, conflicts, summary, cached, analyzedAt } =
    analysis;
  const displayScore =
    typeof finalScore === "number"
      ? finalScore
      : typeof score === "number"
        ? score
        : null;
  const lastUpdated = analyzedAt ? new Date(analyzedAt).toLocaleString() : null;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            Compatibility summary
          </h3>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last analyzed: {lastUpdated}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {cached && (
            <Badge variant="primary" className="text-xs">
              Saved result
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid gap-5 sm:grid-cols-[120px_minmax(0,1fr)] items-center">
          <div
            className={`mx-auto w-28 h-28 sm:w-32 sm:h-32 rounded-full ${getScoreBg(displayScore)} flex items-center justify-center border border-gray-200 shadow-sm`}
          >
            <div className="text-center">
              <span
                className={`text-4xl font-bold ${getScoreColor(displayScore)}`}
              >
                {displayScore ?? "--"}
              </span>
              <span className={`text-sm block ${getScoreColor(displayScore)}`}>
                {displayScore !== null ? "/100" : ""}
              </span>
            </div>
          </div>
          <div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {summary ||
                "A quick summary of how this applicant fits the current roommates."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-green-50 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-green-700 font-semibold">
                  Strengths
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  {pros?.length > 0
                    ? `${pros.length} insight${pros.length > 1 ? "s" : ""}`
                    : "No highlights yet"}
                </p>
              </div>
              <div className="rounded-2xl bg-red-50 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-red-700 font-semibold">
                  Risks
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  {conflicts?.length > 0
                    ? `${conflicts.length} concern${conflicts.length > 1 ? "s" : ""}`
                    : "No concerns found"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {pros?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              What works
            </h4>
            <ul className="space-y-2 list-disc list-inside text-gray-600 text-sm">
              {pros.map((pro, i) => (
                <li key={i}>{pro}</li>
              ))}
            </ul>
          </div>
        )}

        {conflicts?.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Things to watch
            </h4>
            <ul className="space-y-2 list-disc list-inside text-gray-600 text-sm">
              {conflicts.map((conflict, i) => (
                <li key={i}>{conflict}</li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
