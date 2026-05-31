import { useState } from "react";

import { getRenderableMediaUrl } from "@/lib";
import type { CourseMaterial } from "@/types/course.types";

interface MaterialDownloadButtonProps {
	material: CourseMaterial;
}

export function MaterialDownloadButton({ material }: MaterialDownloadButtonProps) {
	const [loading, setLoading] = useState(false);

	const handleClick = async () => {
		if (material.mediaFileId) {
			setLoading(true);
			try {
				const url = await getRenderableMediaUrl(material.mediaFileId);
				window.open(url, "_blank", "noopener,noreferrer");
			} catch {
				if (material.fileUrl) {
					window.open(material.fileUrl, "_blank", "noopener,noreferrer");
				}
			} finally {
				setLoading(false);
			}
			return;
		}
		if (material.fileUrl) {
			window.open(material.fileUrl, "_blank", "noopener,noreferrer");
		}
	};

	if (!material.mediaFileId && !material.fileUrl) {
		return <span className="course-detail__no-file">ChÆ°a cÃ³ file</span>;
	}

	return (
		<button
			type="button"
			className="course-detail__download-btn"
			onClick={handleClick}
			disabled={loading}
		>
			{loading ? "Äang má»Ÿ..." : "Táº£i xuá»‘ng"}
		</button>
	);
}
