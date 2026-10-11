package helpers

import (
	"testing"
	"time"
)

func TestParseTimestamp(t *testing.T) {
	cases := []struct {
		name    string
		value   string
		wantZero bool
	}{
		{"empty", "", true},
		{"invalid", "not a date", true},
		{"rfc3339", "2024-05-01T10:00:00Z", false},
		{"rfc3339nano", "2024-05-01T10:00:00.123456789Z", false},
		{"no timezone", "2024-05-01T10:00:00", false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			parsed := ParseTimestamp(tc.value)

			if tc.wantZero && !parsed.IsZero() {
				t.Fatalf("expected zero time, got %v", parsed)
			}

			if !tc.wantZero && parsed.IsZero() {
				t.Fatalf("expected parsed time, got zero")
			}
		})
	}
}

func TestIsNewer(t *testing.T) {
	newer := "2024-05-01T10:00:00Z"
	older := "2024-05-01T09:00:00Z"

	if !IsNewer(newer, older) {
		t.Fatal("newer timestamp should win")
	}

	if IsNewer(older, newer) {
		t.Fatal("older timestamp should lose")
	}

	if IsNewer(newer, newer) {
		t.Fatal("equal timestamps are not newer")
	}

	// missing timestamps are the oldest possible change
	if !IsNewer(newer, "") {
		t.Fatal("a real timestamp should beat an empty one")
	}

	if IsNewer("", newer) {
		t.Fatal("an empty timestamp should lose")
	}
}

func TestNowTimestampRoundTrip(t *testing.T) {
	now := NowTimestamp()

	parsed := ParseTimestamp(now)
	if parsed.IsZero() {
		t.Fatal("NowTimestamp must be parseable by ParseTimestamp")
	}

	if time.Since(parsed) > time.Minute {
		t.Fatalf("parsed timestamp is not recent: %v", parsed)
	}
}
