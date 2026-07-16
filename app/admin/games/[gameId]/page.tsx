"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Edit2, Check, X, Code, Play } from "lucide-react";
import { toast } from "sonner";

interface GameDetail {
  _id: string;
  gameId: string;
  name: string;
  icon: string;
  difficultyRating: number;
  isActive: boolean;
  difficultyByGrade: Record<string, any>;
  questionPool: Array<Record<string, any>>;
}

export default function GameDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const router = useRouter();
  const { gameId } = use(params);

  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [questionJsonText, setQuestionJsonText] = useState("");
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Available grade ids from data.json
  const gradeIds = [
    "tk_a", "tk_b", "sd_1", "sd_2", "sd_3", "sd_4", "sd_5", "sd_6", "smp_1", "smp_2", "smp_3"
  ];

  const fetchGame = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/games/${gameId}`);
      const data = await res.json();
      if (data.success) {
        setGame(data.game);
      } else {
        toast.error(data.error || "Gagal mengambil data detail game");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi internet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
  }, [gameId]);

  const handleMetadataChange = (key: keyof GameDetail, value: any) => {
    if (!game) return;
    setGame({ ...game, [key]: value });
  };

  const handleGradeConfigChange = (grade: string, field: string, value: any) => {
    if (!game) return;
    const updatedByGrade = { ...game.difficultyByGrade };
    if (!updatedByGrade[grade]) {
      updatedByGrade[grade] = {};
    }
    updatedByGrade[grade][field] = value;
    setGame({ ...game, difficultyByGrade: updatedByGrade });
  };

  const getNewQuestionTemplate = (gId: string) => {
    switch (gId) {
      case "colorMatch":
        return { id: `cm_${Date.now().toString().slice(-6)}`, emoji: "🍎", colorName: "Merah", correctAnswer: "Merah", choices: ["Merah", "Hijau"] };
      case "compareNumbers":
        return { id: `comp_${Date.now().toString().slice(-6)}`, type: "visual", emoji: "🍎", leftCount: 3, rightCount: 2, correctAnswer: ">" };
      case "multipleChoice":
        return { id: `mc_${Date.now().toString().slice(-6)}`, question: "Pertanyaan baru?", choices: ["A", "B", "C"], correctAnswer: "A" };
      case "counting":
        return { id: `count_${Date.now().toString().slice(-6)}`, emoji: "🍎", count: 3, choices: [2, 3, 4], correctAnswer: 3 };
      default:
        return { id: `q_${Date.now().toString().slice(-6)}`, question: "Soal baru?", correctAnswer: "Jawaban" };
    }
  };

  const handleStartAddQuestion = () => {
    if (!game) return;
    const template = getNewQuestionTemplate(game.gameId);
    setQuestionJsonText(JSON.stringify(template, null, 2));
    setIsAddingQuestion(true);
    setEditingQuestionIndex(null);
  };

  const handleStartEditQuestion = (index: number) => {
    if (!game) return;
    setQuestionJsonText(JSON.stringify(game.questionPool[index], null, 2));
    setEditingQuestionIndex(index);
    setIsAddingQuestion(false);
  };

  const handleSaveQuestion = () => {
    if (!game) return;
    try {
      const parsedQuestion = JSON.parse(questionJsonText);
      if (!parsedQuestion.id) {
        toast.error("Soal harus memiliki properti 'id' unik");
        return;
      }

      const updatedPool = [...game.questionPool];
      if (isAddingQuestion) {
        // Check uniqueness of ID
        if (updatedPool.some((q) => q.id === parsedQuestion.id)) {
          toast.error("Properti 'id' sudah digunakan oleh soal lain");
          return;
        }
        updatedPool.push(parsedQuestion);
        toast.success("Berhasil menambahkan soal baru!");
      } else if (editingQuestionIndex !== null) {
        // Edit existing
        updatedPool[editingQuestionIndex] = parsedQuestion;
        toast.success("Berhasil memperbarui soal!");
      }

      setGame({ ...game, questionPool: updatedPool });
      setIsAddingQuestion(false);
      setEditingQuestionIndex(null);
      setQuestionJsonText("");
    } catch (e) {
      toast.error("Format JSON tidak valid. Periksa kembali koma dan tanda kutip.");
    }
  };

  const handleDeleteQuestion = (index: number) => {
    if (!game) return;
    const updatedPool = game.questionPool.filter((_, i) => i !== index);
    setGame({ ...game, questionPool: updatedPool });
    toast.success("Soal berhasil dihapus dari pool!");
  };

  const handleSaveGame = async () => {
    if (!game) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(game),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Konfigurasi game berhasil disimpan ke server!");
        router.push("/admin/games");
      } else {
        toast.error(data.error || "Gagal menyimpan perubahan");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi ke server");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="w-10 h-10 border-4 border-accent-dynamic border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-500 font-bold">Game tidak ditemukan</p>
        <Link href="/admin/games" className="text-accent-dynamic font-bold mt-4 inline-block">
          Kembali ke list game
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/games"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Game</span>
        </Link>

        <button
          onClick={handleSaveGame}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent-dynamic text-accent-dynamic-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-accent-dynamic/20"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>

      {/* Main Grid: Settings & Grade Level configs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Game metadata */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-black uppercase text-foreground">Detail Game</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Nama Game</label>
              <input
                type="text"
                value={game.name}
                onChange={(e) => handleMetadataChange("name", e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Icon (Emoji)</label>
                <input
                  type="text"
                  value={game.icon}
                  onChange={(e) => handleMetadataChange("icon", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-center text-foreground focus:outline-none focus:border-accent-dynamic text-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Rating Kesulitan</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={game.difficultyRating}
                  onChange={(e) => handleMetadataChange("difficultyRating", Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Status Aktif</label>
              <button
                onClick={() => handleMetadataChange("isActive", !game.isActive)}
                className={`w-12 h-6 rounded-full p-1 transition-all ${
                  game.isActive ? "bg-accent-dynamic flex justify-end" : "bg-muted flex justify-start"
                }`}
              >
                <span className="w-4 h-4 bg-card rounded-full shadow-sm"></span>
              </button>
            </div>
          </div>

          {/* Grade difficulty overrides */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-black uppercase text-foreground">Kesulitan per Kelas</h3>
            <p className="text-xs text-muted-foreground leading-tight">
              Tentukan parameter khusus seperti batas waktu (detik) dan mode bermain untuk setiap tingkatan kelas anak.
            </p>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {gradeIds.map((grade) => {
                const config = game.difficultyByGrade[grade] || {};
                return (
                  <div key={grade} className="border-b border-border/40 pb-3 last:border-b-0">
                    <span className="text-xs font-black text-foreground uppercase block mb-2">{grade.replace("_", " ")}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-bold">Waktu (Detik)</span>
                        <input
                          type="number"
                          placeholder="Null (Bebas)"
                          value={config.timeLimit !== undefined && config.timeLimit !== null ? config.timeLimit : ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? null : Number(e.target.value);
                            handleGradeConfigChange(grade, "timeLimit", val);
                          }}
                          className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground font-bold">Variabel Soal</span>
                        <input
                          type="text"
                          placeholder="Nilai/Tipe"
                          value={
                            config.choicesCount !== undefined ? config.choicesCount :
                            config.maxNumber !== undefined ? config.maxNumber : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value === "" ? undefined : Number(e.target.value);
                            if (game.gameId === "colorMatch") {
                              handleGradeConfigChange(grade, "choicesCount", val);
                            } else {
                              handleGradeConfigChange(grade, "maxNumber", val);
                            }
                          }}
                          className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Question Pool and JSON editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editor block if active */}
          {(isAddingQuestion || editingQuestionIndex !== null) && (
            <div className="bg-card border border-accent-dynamic/40 rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black uppercase text-foreground flex items-center gap-2">
                  <Code className="w-5 h-5 text-accent-dynamic" />
                  <span>{isAddingQuestion ? "Tambah Soal Baru (JSON)" : `Edit Soal #${editingQuestionIndex} (JSON)`}</span>
                </h3>
                <button
                  onClick={() => {
                    setIsAddingQuestion(false);
                    setEditingQuestionIndex(null);
                    setQuestionJsonText("");
                  }}
                  className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={questionJsonText}
                onChange={(e) => setQuestionJsonText(e.target.value)}
                rows={8}
                className="w-full bg-background border border-border rounded-xl p-4 text-xs font-mono text-foreground focus:outline-none focus:border-accent-dynamic focus:ring-1 focus:ring-accent-dynamic"
                placeholder="Masukkan format soal dalam JSON..."
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsAddingQuestion(false);
                    setEditingQuestionIndex(null);
                    setQuestionJsonText("");
                  }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="px-4 py-2 bg-accent-dynamic text-accent-dynamic-foreground rounded-lg font-bold text-xs hover:opacity-90 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Soal</span>
                </button>
              </div>
            </div>
          )}

          {/* Question Pool Listing */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black uppercase text-foreground">Pool Soal ({game.questionPool.length})</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Daftar pertanyaan yang akan diambil secara acak saat bermain.</p>
              </div>
              <button
                onClick={handleStartAddQuestion}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent-dynamic text-accent-dynamic-foreground rounded-xl font-bold text-xs hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Soal</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {game.questionPool.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm font-medium">
                  Belum ada soal dalam game ini. Klik "Tambah Soal" untuk membuat soal pertama.
                </div>
              ) : (
                game.questionPool.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="flex justify-between items-center p-4 bg-muted/40 border border-border/50 rounded-xl hover:bg-muted/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black bg-accent-dynamic/10 text-accent-dynamic px-2 py-0.5 rounded">
                          ID: {q.id}
                        </span>
                        {q.emoji && <span className="text-base">{q.emoji}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground max-w-lg font-medium line-clamp-2">
                        {q.question && <span>Tanya: <strong>{q.question}</strong> | </span>}
                        {q.colorName && <span>Warna: <strong>{q.colorName}</strong> | </span>}
                        {q.mixColors && <span>Campuran: <strong>{q.mixColors.join(" + ")}</strong> | </span>}
                        {q.leftCount !== undefined && <span>Kiri: <strong>{q.leftCount}</strong> vs Kanan: <strong>{q.rightCount}</strong> | </span>}
                        <span>Jawaban: <strong className="text-emerald-500">{String(q.correctAnswer)}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditQuestion(idx)}
                        className="p-1.5 hover:bg-card hover:text-accent-dynamic rounded-lg text-muted-foreground transition-all"
                        title="Edit Soal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(idx)}
                        className="p-1.5 hover:bg-card hover:text-rose-500 rounded-lg text-muted-foreground transition-all"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
