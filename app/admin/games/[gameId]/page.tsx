/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Edit2, Check, X, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

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
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");

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

  const processUploadedQuestions = (parsed: any[]) => {
    if (!game) return;
    if (!Array.isArray(parsed)) {
      toast.error("Format data harus berupa daftar soal (Array).");
      return;
    }
    
    // Auto-generate missing IDs
    const sanitized = parsed.map((q, idx) => {
      if (typeof q === "string") {
        return q;
      }
      if (!q.id) {
        return {
          ...q,
          id: `${game.gameId}_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`
        };
      }
      return q;
    });

    const action = confirm(
      `Berhasil membaca ${sanitized.length} soal.\n\nKlik "OK" untuk menggabungkan (Append) dengan soal yang sudah ada.\nKlik "Cancel" untuk mengganti seluruhnya (Overwrite) soal saat ini.`
    );
    
    let updatedPool = [];
    if (action) {
      updatedPool = [...game.questionPool, ...sanitized];
      toast.success(`Berhasil menambahkan ${sanitized.length} soal ke dalam pool!`);
    } else {
      updatedPool = sanitized;
      toast.success(`Berhasil mengganti pool dengan ${sanitized.length} soal baru!`);
    }
    
    setGame({
      ...game,
      questionPool: updatedPool
    });
  };

  const handleDownloadTemplate = () => {
    if (!game) return;
    
    let dataToDownload: any[] = game.questionPool;
    if (dataToDownload.length === 0) {
      dataToDownload = [getNewQuestionTemplate(game.gameId)];
    }
    
    // Omit the 'id' field from each question in the JSON template
    const sanitized = dataToDownload.map((item) => {
      if (typeof item === "string") return item;
      const { id, ...rest } = item;
      return rest;
    });

    const jsonString = JSON.stringify(sanitized, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `template_soal_${game.gameId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Template JSON soal berhasil diunduh!");
  };

  const handleDownloadExcel = () => {
    if (!game) return;
    
    let dataToDownload: any[] = game.questionPool;
    if (dataToDownload.length === 0) {
      dataToDownload = [getNewQuestionTemplate(game.gameId)];
    }

    const rows = dataToDownload.map((item) => {
      if (typeof item === "string") {
        return { emoji: item };
      }
      
      const flatItem: any = {};
      Object.keys(item).forEach((key) => {
        if (key === "id") return; // Omit the 'id' field in Excel template too
        
        const val = item[key];
        if (Array.isArray(val)) {
          flatItem[key] = val.join(", ");
        } else {
          flatItem[key] = val;
        }
      });
      return flatItem;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Soal");
    XLSX.writeFile(workbook, `template_soal_${game.gameId}.xlsx`);
    toast.success("Template Excel (.xlsx) berhasil diunduh!");
  };

  const handleUploadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!game || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          processUploadedQuestions(parsed);
        } catch (err) {
          toast.error("Format file JSON tidak valid.");
        }
      };
      reader.readAsText(file);
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet);
          
          const parsed = rows.map((row: any) => {
            if (game.gameId === "memory" && row.emoji) {
              return String(row.emoji).trim();
            }
            
            const item: any = {};
            Object.keys(row).forEach((key) => {
              const val = row[key];
              const listFields = ["choices", "mixColors", "letters", "syllables", "shuffledLetters", "grades", "paths", "pattern"];
              const numberFields = ["count", "a", "b", "correctAnswer", "cost", "difficultyRating"];
              
              if (listFields.includes(key)) {
                if (typeof val === "string") {
                  item[key] = val.split(",").map(s => s.trim()).filter(Boolean);
                } else if (Array.isArray(val)) {
                  item[key] = val;
                } else {
                  item[key] = [val];
                }
              } else if (numberFields.includes(key) && key !== "correctAnswer") {
                item[key] = Number(val);
              } else {
                item[key] = val;
              }
            });
            return item;
          });
          
          processUploadedQuestions(parsed);
        } catch (err) {
          toast.error("Terjadi kesalahan saat membaca file Excel.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error("Format file tidak didukung. Gunakan .json atau .xlsx/.xls/.csv");
    }
    
    e.target.value = "";
  };

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
        return { id: `mc_${Date.now().toString().slice(-6)}`, subject: "Umum", prompt: "Pertanyaan baru?", choices: ["A", "B", "C"], correctAnswer: "A", grades: ["tk_a"] };
      case "counting":
        return { id: `count_${Date.now().toString().slice(-6)}`, type: "count_objects", object: "apple", emoji: "🍎", count: 3, choices: [2, 3, 4], correctAnswer: 3 };
      case "guessPicture":
        return { id: `gp_${Date.now().toString().slice(-6)}`, category: "hewan", emoji: "🐱", prompt: "Hewan apa ini?", choices: ["Kucing", "Anjing"], correctAnswer: "Kucing" };
      case "mathBalloonPop":
        return { id: `mbp_${Date.now().toString().slice(-6)}`, type: "count_objects", equationText: "Hitung 🍎", emoji: "🍎", count: 3, choices: [2, 3, 4], correctAnswer: 3 };
      case "memory":
        return "🐶";
      case "patternLogic":
        return { id: `pl_${Date.now().toString().slice(-6)}`, type: "AB", pattern: ["🍎", "🍌", "🍎", "🍌", "🍎"], correctAnswer: "🍌", choices: ["🍎", "🍌"] };
      case "puzzle":
        return { id: `puz_${Date.now().toString().slice(-6)}`, name: "Puzzle Baru", theme: "beach", emoji: "🧩", gradient: ["#4fc3f7", "#0288d1", "#01579b"], imageUrl: "" };
      case "sizeSorting":
        return { id: `ss_${Date.now().toString().slice(-6)}`, emoji: "🐳", name: "Paus" };
      case "spelling":
        return { id: `spl_${Date.now().toString().slice(-6)}`, word: "BOLA", emoji: "⚽", syllables: ["BO", "LA"], letters: ["B", "O", "L", "A"], shuffledLetters: ["L", "B", "A", "O"] };
      case "traceLine":
        return { id: `trace_${Date.now().toString().slice(-6)}`, type: "shape", name: "Garis Baru", paths: [[{ x: 100, y: 50 }, { x: 100, y: 150 }]] };
      default:
        return { id: `q_${Date.now().toString().slice(-6)}`, question: "Soal baru?", correctAnswer: "Jawaban" };
    }
  };

  const handleStartAddQuestion = () => {
    if (!game) return;
    const template = getNewQuestionTemplate(game.gameId);
    setQuestionJsonText(JSON.stringify(template, null, 2));
    
    if (game.gameId === "memory") {
      setFormValues({ emoji: template });
    } else {
      setFormValues(JSON.parse(JSON.stringify(template)));
    }

    setIsAddingQuestion(true);
    setEditingQuestionIndex(null);
    setIsJsonMode(false);
  };

  const handleStartEditQuestion = (index: number) => {
    if (!game) return;
    const q = game.questionPool[index];
    setQuestionJsonText(JSON.stringify(q, null, 2));

    if (game.gameId === "memory") {
      setFormValues({ emoji: q });
    } else {
      setFormValues(JSON.parse(JSON.stringify(q)));
    }

    setEditingQuestionIndex(index);
    setIsAddingQuestion(false);
    setIsJsonMode(false);
  };

  const handleToggleMode = () => {
    if (!game) return;
    if (isJsonMode) {
      // JSON -> Form
      try {
        const parsed = JSON.parse(questionJsonText);
        if (game.gameId === "memory") {
          setFormValues({ emoji: typeof parsed === 'string' ? parsed : String(parsed) });
        } else {
          setFormValues(parsed);
        }
        setIsJsonMode(false);
      } catch (err) {
        toast.error("Format JSON tidak valid. Periksa kembali tanda kutip atau koma sebelum beralih.");
      }
    } else {
      // Form -> JSON
      let dataToSerialize = formValues;
      if (game.gameId === "memory") {
        dataToSerialize = formValues.emoji || "";
      } else {
        // Prepare helper cleanups for serialize
        const temp = { ...formValues };
        
        const parseStringArray = (val: any) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") return val.split(",").map(s => s.trim()).filter(Boolean);
          return [];
        };

        const parseNumberArray = (val: any) => {
          if (Array.isArray(val)) return val.map(Number);
          if (typeof val === "string") return val.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
          return [];
        };

        if (game.gameId === "colorMatch") {
          temp.choices = parseStringArray(temp.choices);
          if (temp.mixColors !== undefined) temp.mixColors = parseStringArray(temp.mixColors);
        } else if (game.gameId === "compareNumbers") {
          temp.leftCount = Number(temp.leftCount);
          temp.rightCount = Number(temp.rightCount);
        } else if (game.gameId === "counting" || game.gameId === "mathBalloonPop") {
          if (temp.count !== undefined && temp.count !== "") temp.count = Number(temp.count);
          if (temp.a !== undefined && temp.a !== "") temp.a = Number(temp.a);
          if (temp.b !== undefined && temp.b !== "") temp.b = Number(temp.b);
          temp.correctAnswer = Number(temp.correctAnswer);
          temp.choices = parseNumberArray(temp.choices);
        } else if (game.gameId === "guessPicture" || game.gameId === "multipleChoice") {
          temp.choices = parseStringArray(temp.choices);
        } else if (game.gameId === "patternLogic") {
          temp.pattern = parseStringArray(temp.pattern);
          temp.choices = parseStringArray(temp.choices);
        } else if (game.gameId === "puzzle") {
          temp.gradient = parseStringArray(temp.gradient);
        } else if (game.gameId === "spelling") {
          temp.syllables = parseStringArray(temp.syllables);
          temp.letters = parseStringArray(temp.letters);
          temp.shuffledLetters = parseStringArray(temp.shuffledLetters);
        } else if (game.gameId === "traceLine") {
          if (typeof temp.paths === "string") {
            try { temp.paths = JSON.parse(temp.paths); } catch (e) {}
          }
        }
        dataToSerialize = temp;
      }
      setQuestionJsonText(JSON.stringify(dataToSerialize, null, 2));
      setIsJsonMode(true);
    }
  };

  const handleSaveQuestion = () => {
    if (!game) return;
    try {
      let parsedQuestion: any;
      if (isJsonMode) {
        parsedQuestion = JSON.parse(questionJsonText);
      } else {
        if (game.gameId === "memory") {
          parsedQuestion = formValues.emoji || "🐶";
        } else {
          parsedQuestion = { ...formValues };
          
          const parseStringArray = (val: any) => {
            if (Array.isArray(val)) return val;
            if (typeof val === "string") return val.split(",").map(s => s.trim()).filter(Boolean);
            return [];
          };

          const parseNumberArray = (val: any) => {
            if (Array.isArray(val)) return val.map(Number);
            if (typeof val === "string") return val.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
            return [];
          };

          if (game.gameId === "colorMatch") {
            parsedQuestion.choices = parseStringArray(parsedQuestion.choices);
            if (parsedQuestion.mixColors !== undefined) parsedQuestion.mixColors = parseStringArray(parsedQuestion.mixColors);
          } else if (game.gameId === "compareNumbers") {
            parsedQuestion.leftCount = Number(parsedQuestion.leftCount);
            parsedQuestion.rightCount = Number(parsedQuestion.rightCount);
          } else if (game.gameId === "counting" || game.gameId === "mathBalloonPop") {
            if (parsedQuestion.count !== undefined && parsedQuestion.count !== "") parsedQuestion.count = Number(parsedQuestion.count);
            if (parsedQuestion.a !== undefined && parsedQuestion.a !== "") parsedQuestion.a = Number(parsedQuestion.a);
            if (parsedQuestion.b !== undefined && parsedQuestion.b !== "") parsedQuestion.b = Number(parsedQuestion.b);
            parsedQuestion.correctAnswer = Number(parsedQuestion.correctAnswer);
            parsedQuestion.choices = parseNumberArray(parsedQuestion.choices);
          } else if (game.gameId === "guessPicture" || game.gameId === "multipleChoice") {
            parsedQuestion.choices = parseStringArray(parsedQuestion.choices);
          } else if (game.gameId === "patternLogic") {
            parsedQuestion.pattern = parseStringArray(parsedQuestion.pattern);
            parsedQuestion.choices = parseStringArray(parsedQuestion.choices);
          } else if (game.gameId === "puzzle") {
            parsedQuestion.gradient = parseStringArray(parsedQuestion.gradient);
          } else if (game.gameId === "spelling") {
            parsedQuestion.syllables = parseStringArray(parsedQuestion.syllables);
            parsedQuestion.letters = parseStringArray(parsedQuestion.letters);
            parsedQuestion.shuffledLetters = parseStringArray(parsedQuestion.shuffledLetters);
          } else if (game.gameId === "traceLine") {
            if (typeof parsedQuestion.paths === "string") {
              parsedQuestion.paths = JSON.parse(parsedQuestion.paths);
            }
          }
        }
      }

      if (game.gameId !== "memory" && !parsedQuestion.id) {
        toast.error("Soal harus memiliki properti 'id' unik");
        return;
      }

      const updatedPool = [...game.questionPool];
      if (isAddingQuestion) {
        if (game.gameId !== "memory" && updatedPool.some((q) => q.id === parsedQuestion.id)) {
          toast.error("Properti 'id' sudah digunakan oleh soal lain");
          return;
        }
        updatedPool.push(parsedQuestion);
        toast.success("Berhasil menambahkan soal baru!");
      } else if (editingQuestionIndex !== null) {
        updatedPool[editingQuestionIndex] = parsedQuestion;
        toast.success("Berhasil memperbarui soal!");
      }

      setGame({ ...game, questionPool: updatedPool });
      setIsAddingQuestion(false);
      setEditingQuestionIndex(null);
      setQuestionJsonText("");
    } catch (e) {
      toast.error(isJsonMode ? "Format JSON tidak valid. Periksa kembali koma dan tanda kutip." : "Format koordinat/input form tidak valid.");
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

  const labelStyle = "text-xs font-black text-muted-foreground uppercase block mb-1 tracking-wider";
  const inputStyle = "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic focus:ring-1 focus:ring-accent-dynamic transition-all";
  const selectStyle = "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic focus:ring-1 focus:ring-accent-dynamic transition-all";

  const renderChoicesEditor = (isNumber: boolean = false) => {
    const choices = Array.isArray(formValues.choices) ? formValues.choices : [];
    
    const handleChoiceChange = (idx: number, val: string) => {
      const updatedChoices = [...choices];
      updatedChoices[idx] = isNumber ? (val === "" ? "" : Number(val)) : val;
      setFormValues({ ...formValues, choices: updatedChoices });
    };

    const handleAddChoice = () => {
      setFormValues({
        ...formValues,
        choices: [...choices, isNumber ? 0 : ""]
      });
    };

    const handleRemoveChoice = (idx: number) => {
      setFormValues({
        ...formValues,
        choices: choices.filter((_: any, i: number) => i !== idx)
      });
    };

    return (
      <div className="space-y-2">
        <label className={labelStyle}>Pilihan Jawaban</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {choices.map((choice: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 bg-background border border-border/60 p-1.5 rounded-xl">
              <input
                type={isNumber ? "number" : "text"}
                value={choice}
                onChange={(e) => handleChoiceChange(idx, e.target.value)}
                className="flex-1 bg-transparent border-0 px-2 py-1 text-xs text-foreground focus:outline-none"
                placeholder={`Pilihan ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => handleRemoveChoice(idx)}
                className="p-1 hover:bg-rose-500/15 hover:text-rose-500 rounded-lg text-muted-foreground transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddChoice}
          className="text-xs text-accent-dynamic font-bold hover:opacity-85 flex items-center gap-1 mt-1 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Pilihan
        </button>
      </div>
    );
  };

  const renderColorMatchFields = () => {
    const isMixing = formValues.mixColors !== undefined;
    
    const handleToggleMixing = () => {
      if (isMixing) {
        const { mixColors, ...rest } = formValues;
        setFormValues({
          ...rest,
          colorName: "Merah"
        });
      } else {
        const { colorName, ...rest } = formValues;
        setFormValues({
          ...rest,
          mixColors: ["Merah", "Kuning"]
        });
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className={labelStyle}>Emoji</label>
          <input
            type="text"
            value={formValues.emoji || ""}
            onChange={(e) => setFormValues({ ...formValues, emoji: e.target.value })}
            className={inputStyle}
            placeholder="🍎"
          />
        </div>

        <div>
          <label className={labelStyle}>Tipe Warna</label>
          <div className="flex gap-4 bg-background border border-border/50 p-2 rounded-xl">
            <label className="flex items-center gap-2 text-xs text-foreground font-bold cursor-pointer select-none">
              <input
                type="radio"
                name="colorMatchType"
                checked={!isMixing}
                onChange={handleToggleMixing}
                className="accent-accent-dynamic w-3.5 h-3.5"
              />
              Warna Tunggal
            </label>
            <label className="flex items-center gap-2 text-xs text-foreground font-bold cursor-pointer select-none">
              <input
                type="radio"
                name="colorMatchType"
                checked={isMixing}
                onChange={handleToggleMixing}
                className="accent-accent-dynamic w-3.5 h-3.5"
              />
              Campuran Warna
            </label>
          </div>
        </div>

        {!isMixing ? (
          <div>
            <label className={labelStyle}>Nama Warna</label>
            <input
              type="text"
              value={formValues.colorName || ""}
              onChange={(e) => setFormValues({ ...formValues, colorName: e.target.value })}
              className={inputStyle}
              placeholder="Merah"
            />
          </div>
        ) : (
          <div>
            <label className={labelStyle}>Bahan Campuran Warna (pisahkan dengan koma)</label>
            <input
              type="text"
              value={Array.isArray(formValues.mixColors) ? formValues.mixColors.join(", ") : ""}
              onChange={(e) => setFormValues({ ...formValues, mixColors: e.target.value })}
              className={inputStyle}
              placeholder="Merah, Kuning"
            />
          </div>
        )}

        <div>
          <label className={labelStyle}>Jawaban Benar</label>
          <input
            type="text"
            value={formValues.correctAnswer || ""}
            onChange={(e) => setFormValues({ ...formValues, correctAnswer: e.target.value })}
            className={inputStyle}
            placeholder="Merah / Jingga"
          />
        </div>

        {renderChoicesEditor(false)}
      </div>
    );
  };

  const renderCompareNumbersFields = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelStyle}>Tipe Tampilan</label>
          <select
            value={formValues.type || "visual"}
            onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
            className={selectStyle}
          >
            <option value="visual">Visual (Dengan Gambar)</option>
            <option value="numerical">Numerical (Hanya Angka)</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelStyle}>Emoji</label>
            <input
              type="text"
              value={formValues.emoji || ""}
              onChange={(e) => setFormValues({ ...formValues, emoji: e.target.value })}
              className={inputStyle}
              placeholder="🍎"
            />
          </div>
          <div>
            <label className={labelStyle}>Jumlah Kiri</label>
            <input
              type="number"
              value={formValues.leftCount !== undefined ? formValues.leftCount : ""}
              onChange={(e) => setFormValues({ ...formValues, leftCount: e.target.value })}
              className={inputStyle}
              placeholder="3"
            />
          </div>
          <div>
            <label className={labelStyle}>Jumlah Kanan</label>
            <input
              type="number"
              value={formValues.rightCount !== undefined ? formValues.rightCount : ""}
              onChange={(e) => setFormValues({ ...formValues, rightCount: e.target.value })}
              className={inputStyle}
              placeholder="2"
            />
          </div>
        </div>

        <div>
          <label className={labelStyle}>Jawaban Benar</label>
          <select
            value={formValues.correctAnswer || ">"}
            onChange={(e) => setFormValues({ ...formValues, correctAnswer: e.target.value })}
            className={selectStyle}
          >
            <option value=">">&gt; (Lebih Dari)</option>
            <option value="<">&lt; (Kurang Dari)</option>
            <option value="=">= (Sama Dengan)</option>
          </select>
        </div>
      </div>
    );
  };

  const renderCountingFields = () => {
    const type = formValues.type || "count_objects";
    
    return (
      <div className="space-y-4">
        <div>
          <label className={labelStyle}>Tipe Soal</label>
          <select
            value={type}
            onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
            className={selectStyle}
          >
              <option value="count_objects">Menghitung Objek</option>
              <option value="addition">Penjumlahan (+)</option>
              <option value="subtraction">Pengurangan (-)</option>
              <option value="multiplication">Perkalian (×)</option>
              <option value="division">Pembagian (÷)</option>
            </select>
          </div>

        {type === "count_objects" ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelStyle}>Nama Objek</label>
              <input
                type="text"
                value={formValues.object || ""}
                onChange={(e) => setFormValues({ ...formValues, object: e.target.value })}
                className={inputStyle}
                placeholder="apple"
              />
            </div>
            <div>
              <label className={labelStyle}>Emoji</label>
              <input
                type="text"
                value={formValues.emoji || ""}
                onChange={(e) => setFormValues({ ...formValues, emoji: e.target.value })}
                className={inputStyle}
                placeholder="🍎"
              />
            </div>
            <div>
              <label className={labelStyle}>Jumlah (Count)</label>
              <input
                type="number"
                value={formValues.count !== undefined ? formValues.count : ""}
                onChange={(e) => setFormValues({ ...formValues, count: e.target.value })}
                className={inputStyle}
                placeholder="3"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 items-end">
              <div>
                <label className={labelStyle}>Angka A</label>
                <input
                  type="number"
                  value={formValues.a !== undefined ? formValues.a : ""}
                  onChange={(e) => setFormValues({ ...formValues, a: e.target.value })}
                  className={inputStyle}
                  placeholder="5"
                />
              </div>
              <div className="flex justify-center pb-2 items-center font-black text-sm text-muted-foreground uppercase">
                {type === "addition" ? "Tambah (+)" : type === "subtraction" ? "Kurang (-)" : type === "multiplication" ? "Kali (×)" : "Bagi (÷)"}
              </div>
              <div>
                <label className={labelStyle}>Angka B</label>
                <input
                  type="number"
                  value={formValues.b !== undefined ? formValues.b : ""}
                  onChange={(e) => setFormValues({ ...formValues, b: e.target.value })}
                  className={inputStyle}
                  placeholder="3"
                />
              </div>
              <div>
                <label className={labelStyle}>Emoji Objek</label>
                <input
                  type="text"
                  value={formValues.emoji || ""}
                  onChange={(e) => setFormValues({ ...formValues, emoji: e.target.value })}
                  className={inputStyle}
                  placeholder="⭐"
                />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Teks Persamaan (Opsional)</label>
              <input
                type="text"
                value={formValues.equationText || ""}
                onChange={(e) => setFormValues({ ...formValues, equationText: e.target.value })}
                className={inputStyle}
                placeholder="Misal: 5 + 3 = ?"
              />
            </div>
          </div>
        )}

        <div>
          <label className={labelStyle}>Jawaban Benar (Angka)</label>
          <input
            type="number"
            value={formValues.correctAnswer !== undefined ? formValues.correctAnswer : ""}
            onChange={(e) => setFormValues({ ...formValues, correctAnswer: e.target.value })}
            className={inputStyle}
            placeholder="3"
          />
        </div>

        {renderChoicesEditor(true)}
      </div>
    );
  };

  const renderGuessPictureFields = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Kategori</label>
            <input
              type="text"
              value={formValues.category || ""}
              onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
              className={inputStyle}
              placeholder="hewan"
            />
          </div>
          <div>
            <label className={labelStyle}>Emoji</label>
            <input
              type="text"
              value={formValues.emoji || ""}
              onChange={(e) => setFormValues({ ...formValues, emoji: e.target.value })}
              className={inputStyle}
              placeholder="🐱"
            />
          </div>
        </div>

        <div>
          <label className={labelStyle}>Pertanyaan (Prompt)</label>
          <input
            type="text"
            value={formValues.prompt || ""}
            onChange={(e) => setFormValues({ ...formValues, prompt: e.target.value })}
            className={inputStyle}
            placeholder="Hewan apa ini?"
          />
        </div>

        <div>
          <label className={labelStyle}>Jawaban Benar</label>
          <input
            type="text"
            value={formValues.correctAnswer || ""}
            onChange={(e) => setFormValues({ ...formValues, correctAnswer: e.target.value })}
            className={inputStyle}
            placeholder="Kucing"
          />
        </div>

        {renderChoicesEditor(false)}
      </div>
    );
  };

  const renderMathBalloonPopFields = () => {
    const type = formValues.type || "count_objects";
    return (
      <div className="space-y-4">
        <div>
          <label className={labelStyle}>Tipe Soal</label>
          <select
            value={type}
            onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
            className={selectStyle}
          >
              <option value="count_objects">Menghitung Objek</option>
              <option value="addition">Penjumlahan</option>
              <option value="subtraction">Pengurangan</option>
              <option value="multiplication">Perkalian</option>
              <option value="division">Pembagian</option>
            </select>
          </div>

        <div>
          <label className={labelStyle}>Teks Persamaan</label>
          <input
            type="text"
            value={formValues.equationText || ""}
            onChange={(e) => setFormValues({ ...formValues, equationText: e.target.value })}
            className={inputStyle}
            placeholder="Hitung 🍎 atau 3 + 2 = ?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Emoji (Opsional)</label>
            <input
              type="text"
              value={formValues.emoji || ""}
              onChange={(e) => setFormValues({ ...formValues, emoji: e.target.value })}
              className={inputStyle}
              placeholder="🍎"
            />
          </div>
          <div>
            <label className={labelStyle}>Jumlah Objek (Opsional)</label>
            <input
              type="number"
              value={formValues.count !== undefined ? formValues.count : ""}
              onChange={(e) => setFormValues({ ...formValues, count: e.target.value })}
              className={inputStyle}
              placeholder="3"
            />
          </div>
        </div>

        <div>
          <label className={labelStyle}>Jawaban Benar</label>
          <input
            type="number"
            value={formValues.correctAnswer !== undefined ? formValues.correctAnswer : ""}
            onChange={(e) => setFormValues({ ...formValues, correctAnswer: e.target.value })}
            className={inputStyle}
            placeholder="3"
          />
        </div>

        {renderChoicesEditor(true)}
      </div>
    );
  };

  const renderMemoryFields = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelStyle}>Emoji Kartu</label>
          <input
            type="text"
            value={formValues.emoji || ""}
            onChange={(e) => setFormValues({ ...formValues, emoji: e.target.value })}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center text-4xl text-foreground focus:outline-none focus:border-accent-dynamic focus:ring-1 focus:ring-accent-dynamic"
            placeholder="🐶"
          />
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Masukkan emoji kartu. Game Memori akan mencocokkan pasangan emoji dari pool ini saat bermain.
          </p>
        </div>
      </div>
    );
  };

  const renderMultipleChoiceFields = () => {
    const gradesList = [
      "tk_a", "tk_b", "sd_1", "sd_2", "sd_3", "sd_4", "sd_5", "sd_6", "smp_1", "smp_2", "smp_3"
    ];
    
    const selectedGrades = Array.isArray(formValues.grades) ? formValues.grades : [];

    const handleGradeToggle = (gradeId: string) => {
      let updatedGrades = [...selectedGrades];
      if (updatedGrades.includes(gradeId)) {
        updatedGrades = updatedGrades.filter(g => g !== gradeId);
      } else {
        updatedGrades.push(gradeId);
      }
      setFormValues({ ...formValues, grades: updatedGrades });
    };

    return (
      <div className="space-y-4">
        <div>
          <label className={labelStyle}>Mata Pelajaran</label>
          <select
            value={formValues.subject || "Umum"}
            onChange={(e) => setFormValues({ ...formValues, subject: e.target.value })}
            className={selectStyle}
          >
            <option value="Matematika">Matematika</option>
            <option value="IPA">IPA</option>
            <option value="IPS">IPS</option>
            <option value="Bahasa">Bahasa</option>
            <option value="Umum">Umum</option>
          </select>
        </div>

        <div>
          <label className={labelStyle}>Pertanyaan (Prompt)</label>
          <textarea
            value={formValues.prompt || ""}
            onChange={(e) => setFormValues({ ...formValues, prompt: e.target.value })}
            rows={3}
            className={`${inputStyle} font-medium`}
            placeholder="Tulis pertanyaan di sini..."
          />
        </div>

        <div>
          <label className={labelStyle}>Target Kelas (Grades)</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-background border border-border p-3 rounded-xl">
            {gradesList.map((g) => (
              <label key={g} className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer font-bold uppercase select-none">
                <input
                  type="checkbox"
                  checked={selectedGrades.includes(g)}
                  onChange={() => handleGradeToggle(g)}
                  className="accent-accent-dynamic w-3.5 h-3.5"
                />
                <span>{g.replace("_", " ")}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelStyle}>Jawaban Benar</label>
          <input
            type="text"
            value={formValues.correctAnswer || ""}
            onChange={(e) => setFormValues({ ...formValues, correctAnswer: e.target.value })}
            className={inputStyle}
            placeholder="Pilihan yang benar..."
          />
        </div>

        {renderChoicesEditor(false)}
      </div>
    );
  };

  const renderPatternLogicFields = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelStyle}>Tipe Pola</label>
          <select
            value={formValues.type || "AB"}
            onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
            className={selectStyle}
          >
            <option value="AB">AB (E.g. A, B, A, B, A)</option>
            <option value="ABB">ABB (E.g. A, B, B, A, B, B)</option>
            <option value="ABC">ABC (E.g. A, B, C, A, B, C)</option>
            <option value="number">Deret Angka</option>
          </select>
        </div>

        <div>
          <label className={labelStyle}>Urutan Pola (pisahkan dengan koma)</label>
          <input
            type="text"
            value={Array.isArray(formValues.pattern) ? formValues.pattern.join(", ") : ""}
            onChange={(e) => setFormValues({ ...formValues, pattern: e.target.value })}
            className={inputStyle}
            placeholder="🍎, 🍌, 🍎, 🍌, 🍎"
          />
        </div>

        <div>
          <label className={labelStyle}>Jawaban Benar</label>
          <input
            type="text"
            value={formValues.correctAnswer || ""}
            onChange={(e) => setFormValues({ ...formValues, correctAnswer: e.target.value })}
            className={inputStyle}
            placeholder="🍌"
          />
        </div>

        {renderChoicesEditor(false)}
      </div>
    );
  };

  const renderPuzzleFields = () => {
    const gradient = Array.isArray(formValues.gradient) ? formValues.gradient : ["#4fc3f7", "#0288d1", "#01579b"];

    const handleGradientChange = (idx: number, color: string) => {
      const updated = [...gradient];
      updated[idx] = color;
      setFormValues({ ...formValues, gradient: updated });
    };

    return (
      <div className="space-y-4">
        <div>
          <label className={labelStyle}>Nama Puzzle</label>
          <input
            type="text"
            value={formValues.name || ""}
            onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
            className={inputStyle}
            placeholder="Pantai Indah"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Tema</label>
            <input
              type="text"
              value={formValues.theme || ""}
              onChange={(e) => setFormValues({ ...formValues, theme: e.target.value })}
              className={inputStyle}
              placeholder="beach"
            />
          </div>
          <div>
            <label className={labelStyle}>Emoji Kunci</label>
            <input
              type="text"
              value={formValues.emoji || ""}
              onChange={(e) => setFormValues({ ...formValues, emoji: e.target.value })}
              className={inputStyle}
              placeholder="🏖️"
            />
          </div>
        </div>

        <div>
          <label className={labelStyle}>URL Gambar</label>
          <input
            type="text"
            value={formValues.imageUrl || ""}
            onChange={(e) => setFormValues({ ...formValues, imageUrl: e.target.value })}
            className={inputStyle}
            placeholder="https://images.unsplash.com/photo-..."
          />
        </div>

        <div>
          <label className={labelStyle}>Warna Background Gradient (3 HEX)</label>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex gap-1.5 items-center bg-background border border-border p-1 rounded-xl">
                <input
                  type="color"
                  value={gradient[idx] && gradient[idx].startsWith('#') ? gradient[idx] : "#cccccc"}
                  onChange={(e) => handleGradientChange(idx, e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={gradient[idx] || ""}
                  onChange={(e) => handleGradientChange(idx, e.target.value)}
                  className="w-full bg-transparent border-0 text-xs text-foreground focus:outline-none"
                  placeholder="#000000"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSizeSortingFields = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Emoji</label>
            <input
              type="text"
              value={formValues.emoji || ""}
              onChange={(e) => setFormValues({ ...formValues, emoji: e.target.value })}
              className={inputStyle}
              placeholder="🐳"
            />
          </div>
          <div>
            <label className={labelStyle}>Nama Benda</label>
            <input
              type="text"
              value={formValues.name || ""}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              className={inputStyle}
              placeholder="Paus"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/40 font-medium">
          Soal Urutkan Ukuran hanya butuh 1 item. Game engine akan memadukan beberapa item dari pool ini dan meminta anak mengurutkannya secara visual.
        </p>
      </div>
    );
  };

  const renderSpellingFields = () => {
    const handleAutoLetters = () => {
      const word = (formValues.word || "").trim().toUpperCase();
      if (!word) {
        toast.error("Tulis Kata terlebih dahulu.");
        return;
      }
      const letters = word.split("");
      const shuffled = [...letters].sort(() => Math.random() - 0.5);

      setFormValues({
        ...formValues,
        letters: letters,
        shuffledLetters: shuffled
      });
      toast.success("Berhasil membuat huruf terpisah & acak!");
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Kata (Word)</label>
            <input
              type="text"
              value={formValues.word || ""}
              onChange={(e) => setFormValues({ ...formValues, word: e.target.value.toUpperCase() })}
              className={inputStyle}
              placeholder="BOLA"
            />
          </div>
          <div>
            <label className={labelStyle}>Emoji</label>
            <input
              type="text"
              value={formValues.emoji || ""}
              onChange={(e) => setFormValues({ ...formValues, emoji: e.target.value })}
              className={inputStyle}
              placeholder="⚽"
            />
          </div>
        </div>

        <div>
          <label className={labelStyle}>Suku Kata (Syllables - pisahkan dengan koma)</label>
          <input
            type="text"
            value={Array.isArray(formValues.syllables) ? formValues.syllables.join(", ") : ""}
            onChange={(e) => setFormValues({ ...formValues, syllables: e.target.value })}
            className={inputStyle}
            placeholder="BO, LA"
          />
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className={labelStyle}>Huruf Terpisah (Letters - pisahkan dengan koma)</label>
            <input
              type="text"
              value={Array.isArray(formValues.letters) ? formValues.letters.join(", ") : ""}
              onChange={(e) => setFormValues({ ...formValues, letters: e.target.value })}
              className={inputStyle}
              placeholder="B, O, L, A"
            />
          </div>
          <button
            type="button"
            onClick={handleAutoLetters}
            className="px-4 py-2.5 bg-accent-dynamic text-accent-dynamic-foreground hover:opacity-90 rounded-xl text-xs font-black h-[38px] transition-colors"
          >
            Auto Generate
          </button>
        </div>

        <div>
          <label className={labelStyle}>Huruf Acak (Shuffled Letters - pisahkan dengan koma)</label>
          <input
            type="text"
            value={Array.isArray(formValues.shuffledLetters) ? formValues.shuffledLetters.join(", ") : ""}
            onChange={(e) => setFormValues({ ...formValues, shuffledLetters: e.target.value })}
            className={inputStyle}
            placeholder="L, B, A, O"
          />
        </div>
      </div>
    );
  };

  const renderTraceLineFields = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelStyle}>Tipe Garis</label>
          <select
            value={formValues.type || "shape"}
            onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
            className={selectStyle}
          >
              <option value="shape">Bentuk (Shape)</option>
              <option value="number">Angka (Number)</option>
              <option value="letter">Huruf (Letter)</option>
            </select>
          </div>

        <div>
          <label className={labelStyle}>Nama Garis / Gambar</label>
          <input
            type="text"
            value={formValues.name || ""}
            onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
            className={inputStyle}
            placeholder="Lingkaran"
          />
        </div>

        <div>
          <label className={labelStyle}>Koordinat Path (JSON format)</label>
          <textarea
            value={typeof formValues.paths === "string" ? formValues.paths : JSON.stringify(formValues.paths || [[]])}
            onChange={(e) => setFormValues({ ...formValues, paths: e.target.value })}
            rows={4}
            className="w-full bg-background border border-border rounded-xl p-3 text-xs font-mono text-foreground focus:outline-none focus:border-accent-dynamic focus:ring-1 focus:ring-accent-dynamic"
            placeholder="[[{&quot;x&quot;:100,&quot;y&quot;:50},...]]"
          />
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            Path dibentuk dari array 2-dimensi koordinat titik x dan y (lebar/tinggi 0-200).
          </p>
        </div>
      </div>
    );
  };

  const renderFallbackFields = () => {
    if (!game) return null;
    if (game.gameId === "wordFinder") {
      return (
        <div className="text-sm text-center py-6 text-muted-foreground font-medium bg-muted/20 rounded-xl border border-border/40 p-4">
          <p className="text-accent-dynamic font-black text-sm uppercase mb-1">Informasi Cari Kata</p>
          Game ini diatur otomatis berdasarkan parameter <span className="underline">Daftar Kata (wordList)</span> di panel kesulitan kelas sebelah kiri. Tidak memerlukan pool soal statis.
        </div>
      );
    }
    if (game.gameId === "fastTap") {
      return (
        <div className="text-sm text-center py-6 text-muted-foreground font-medium bg-muted/20 rounded-xl border border-border/40 p-4">
          <p className="text-accent-dynamic font-black text-sm uppercase mb-1">Informasi Pukul Tikus</p>
          Game ini berjalan dinamis dengan memunculkan tikus secara acak. Tidak memerlukan pool soal statis.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <label className={labelStyle}>Pertanyaan</label>
          <input
            type="text"
            value={formValues.question || ""}
            onChange={(e) => setFormValues({ ...formValues, question: e.target.value })}
            className={inputStyle}
            placeholder="Soal baru?"
          />
        </div>
        <div>
          <label className={labelStyle}>Jawaban Benar</label>
          <input
            type="text"
            value={formValues.correctAnswer || ""}
            onChange={(e) => setFormValues({ ...formValues, correctAnswer: e.target.value })}
            className={inputStyle}
            placeholder="Jawaban"
          />
        </div>
      </div>
    );
  };

  const renderFormFields = () => {
    if (!game) return null;
    switch (game.gameId) {
      case "colorMatch":
        return renderColorMatchFields();
      case "compareNumbers":
        return renderCompareNumbersFields();
      case "counting":
        return renderCountingFields();
      case "guessPicture":
        return renderGuessPictureFields();
      case "mathBalloonPop":
        return renderMathBalloonPopFields();
      case "memory":
        return renderMemoryFields();
      case "multipleChoice":
        return renderMultipleChoiceFields();
      case "patternLogic":
        return renderPatternLogicFields();
      case "puzzle":
        return renderPuzzleFields();
      case "sizeSorting":
        return renderSizeSortingFields();
      case "spelling":
        return renderSpellingFields();
      case "traceLine":
        return renderTraceLineFields();
      default:
        return renderFallbackFields();
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

  const showQuestionForms = game.gameId !== "wordFinder" && game.gameId !== "fastTap";

  const questionPoolWithIndex = (game?.questionPool || []).map((q, idx) => ({ q, originalIndex: idx }));

  const filteredPool = questionPoolWithIndex.filter(({ q }) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const itemVal = q as any;
    
    if (typeof itemVal === "string") {
      return itemVal.toLowerCase().includes(query);
    }
    
    const fieldsToSearch = [
      itemVal.id,
      itemVal.emoji,
      itemVal.question,
      itemVal.prompt,
      itemVal.word,
      itemVal.colorName,
      itemVal.correctAnswer !== undefined ? String(itemVal.correctAnswer) : "",
      Array.isArray(itemVal.mixColors) ? itemVal.mixColors.join(" ") : "",
      itemVal.subject
    ];
    
    return fieldsToSearch.some(field => field && field.toLowerCase().includes(query));
  });

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
            <p className="text-xs text-muted-foreground leading-tight font-medium">
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

        {/* Right Side: Question Pool and Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editor block if active */}
          {(isAddingQuestion || editingQuestionIndex !== null) && (
            <div className="bg-card border border-accent-dynamic/40 rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <h3 className="text-base font-black uppercase text-foreground flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-accent-dynamic" />
                  <span>{isAddingQuestion ? "Tambah Soal Baru" : `Edit Soal #${editingQuestionIndex}`}</span>
                </h3>
                
                <div className="flex items-center gap-4">
                  {showQuestionForms && (
                    <div className="flex bg-muted p-1 rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() => isJsonMode && handleToggleMode()}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          !isJsonMode
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Form
                      </button>
                      <button
                        type="button"
                        onClick={() => !isJsonMode && handleToggleMode()}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          isJsonMode
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        JSON
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsAddingQuestion(false);
                      setEditingQuestionIndex(null);
                      setQuestionJsonText("");
                    }}
                    className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor Fields */}
              <div className="py-2">
                {isJsonMode || !showQuestionForms ? (
                  <textarea
                    value={questionJsonText}
                    onChange={(e) => setQuestionJsonText(e.target.value)}
                    rows={10}
                    className="w-full bg-background border border-border rounded-xl p-4 text-xs font-mono text-foreground focus:outline-none focus:border-accent-dynamic focus:ring-1 focus:ring-accent-dynamic"
                    placeholder="Masukkan format soal dalam JSON..."
                  />
                ) : (
                  renderFormFields()
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
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
                <h3 className="text-base font-black uppercase text-foreground">
                  Pool Soal {searchQuery ? `(${filteredPool.length}/${game.questionPool.length})` : `(${game.questionPool.length})`}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">Daftar pertanyaan yang akan diambil secara acak saat bermain.</p>
              </div>

              {showQuestionForms && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl font-bold text-xs transition-all border border-border/40"
                    title="Unduh Template Soal sebagai JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl font-bold text-xs transition-all border border-border/40"
                    title="Unduh Template Soal sebagai Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Excel</span>
                  </button>
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl font-bold text-xs transition-all border border-border/40 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept=".json,.xlsx,.xls,.csv"
                      onChange={handleUploadTemplate}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleStartAddQuestion}
                    className="flex items-center gap-1.5 px-4 py-2 bg-accent-dynamic text-accent-dynamic-foreground rounded-xl font-bold text-xs hover:opacity-90 transition-all shadow-sm shadow-accent-dynamic/15"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Soal</span>
                  </button>
                </div>
              )}
            </div>

            {/* Search Input Filter */}
            {game.questionPool.length > 0 && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari soal berdasarkan ID, pertanyaan, kata, atau jawaban..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-2.5 pl-10 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent-dynamic focus:ring-1 focus:ring-accent-dynamic transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground text-xs font-black uppercase tracking-wider"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {game.questionPool.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm font-medium">
                  {showQuestionForms ? (
                    'Belum ada soal dalam game ini. Klik "Tambah Soal" untuk membuat soal pertama.'
                  ) : (
                    'Game ini tidak menggunakan pool soal statis.'
                  )}
                </div>
              ) : filteredPool.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm font-medium">
                  Tidak ada soal yang cocok dengan pencarian &quot;{searchQuery}&quot;.
                </div>
              ) : (
                filteredPool.map(({ q, originalIndex }) => (
                  <div
                    key={typeof q === "string" ? `str_${originalIndex}` : (q.id || originalIndex)}
                    className="flex justify-between items-center p-4 bg-muted/40 border border-border/50 rounded-xl hover:bg-muted/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black bg-accent-dynamic/10 text-accent-dynamic px-2 py-0.5 rounded">
                          ID: {typeof q === "string" ? `card_${originalIndex + 1}` : q.id}
                        </span>
                        {(typeof q === "string" ? q : q.emoji) && (
                          <span className="text-base">{typeof q === "string" ? q : q.emoji}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground max-w-lg font-medium line-clamp-2">
                        {typeof q === "object" && q !== null ? (
                          <>
                            {q.question && <span>Tanya: <strong>{q.question}</strong> | </span>}
                            {q.prompt && <span>Tanya: <strong>{q.prompt}</strong> | </span>}
                            {q.word && <span>Kata: <strong>{q.word}</strong> | </span>}
                            {q.colorName && <span>Warna: <strong>{q.colorName}</strong> | </span>}
                            {q.mixColors && <span>Campuran: <strong>{q.mixColors.join(" + ")}</strong> | </span>}
                            {q.leftCount !== undefined && <span>Kiri: <strong>{q.leftCount}</strong> vs Kanan: <strong>{q.rightCount}</strong> | </span>}
                            {q.correctAnswer !== undefined && <span>Jawaban: <strong className="text-emerald-500">{String(q.correctAnswer)}</strong></span>}
                          </>
                        ) : (
                          <span>Kartu Emoji: <strong className="text-accent-dynamic">{q}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditQuestion(originalIndex)}
                        className="p-1.5 hover:bg-card hover:text-accent-dynamic rounded-lg text-muted-foreground transition-all"
                        title="Edit Soal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(originalIndex)}
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
