/**
 * 시간 형식 변환 유틸리티
 * 24시간 형식 설정에 따라 시간을 변환합니다.
 */

/**
 * 24시간 형식(HH:mm)을 12시간 형식(오전/오후 h:mm)으로 변환
 */
export function formatTimeTo12Hour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? '오후' : '오전';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${period} ${displayHour}:${String(minutes).padStart(2, '0')}`;
}

/**
 * 시간 형식 변환 (설정에 따라)
 * @param time HH:mm 형식의 시간 문자열
 * @param use24Hour 24시간 형식 사용 여부
 * @returns 변환된 시간 문자열
 */
export function formatTime(time: string, use24Hour: boolean): string {
  if (use24Hour) {
    return time; // 24시간 형식 그대로 반환
  }
  return formatTimeTo12Hour(time); // 12시간 형식으로 변환
}

/**
 * 시간 범위 형식 변환 (예: "09:00-13:00" 또는 "오전 9:00 - 오후 1:00")
 * @param startTime 시작 시간 (HH:mm)
 * @param endTime 종료 시간 (HH:mm)
 * @param use24Hour 24시간 형식 사용 여부
 * @returns 변환된 시간 범위 문자열
 */
export function formatTimeRange(startTime: string, endTime: string, use24Hour: boolean): string {
  if (use24Hour) {
    return `${startTime}-${endTime}`;
  }
  return `${formatTimeTo12Hour(startTime)} - ${formatTimeTo12Hour(endTime)}`;
}

/**
 * 시간 문자열 파싱 및 변환 (예: "09:00-13:00" 또는 "오전 9:00 - 오후 1:00")
 * @param timeStr 시간 문자열
 * @param use24Hour 24시간 형식 사용 여부
 * @returns 변환된 시간 문자열
 */
export function formatTimeString(timeStr: string, use24Hour: boolean): string {
  // 이미 12시간 형식인 경우 (오전/오후 포함)
  if (timeStr.includes('오전') || timeStr.includes('오후')) {
    if (use24Hour) {
      // 12시간 형식을 24시간 형식으로 변환
      return convert12To24Hour(timeStr);
    }
    return timeStr; // 이미 12시간 형식이면 그대로 반환
  }

  // 24시간 형식인 경우 (HH:mm-HH:mm)
  if (timeStr.includes('-')) {
    const [start, end] = timeStr.split('-').map(s => s.trim());
    if (use24Hour) {
      return `${start}-${end}`;
    }
    return `${formatTimeTo12Hour(start)} - ${formatTimeTo12Hour(end)}`;
  }

  // 단일 시간인 경우
  return formatTime(timeStr, use24Hour);
}

/**
 * 12시간 형식 문자열을 24시간 형식으로 변환
 * @param timeStr "오전 9:00 - 오후 1:00" 형식
 * @returns "09:00-13:00" 형식
 */
function convert12To24Hour(timeStr: string): string {
  const parts = timeStr.split(' - ');
  const converted = parts.map(part => {
    const trimmed = part.trim();
    if (trimmed.startsWith('오전')) {
      const time = trimmed.replace('오전', '').trim();
      const [hour, minute] = time.split(':').map(Number);
      const hour24 = hour === 12 ? 0 : hour;
      return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    } else if (trimmed.startsWith('오후')) {
      const time = trimmed.replace('오후', '').trim();
      const [hour, minute] = time.split(':').map(Number);
      const hour24 = hour === 12 ? 12 : hour + 12;
      return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
    return trimmed;
  });
  return converted.join('-');
}

/**
 * localStorage에서 24시간 형식 설정 가져오기
 */
export function getUse24HourSetting(): boolean {
  try {
    const saved = localStorage.getItem('workEnvironment');
    if (saved) {
      const env = JSON.parse(saved);
      return env.use24Hour === true;
    }
  } catch (error) {
    console.error('Failed to load 24-hour format setting:', error);
  }
  return false; // 기본값: 12시간 형식
}

