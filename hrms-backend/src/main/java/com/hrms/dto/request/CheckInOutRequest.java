package com.hrms.dto.request;

/** Empty-bodied by default; employee is resolved from the authenticated principal. Kept as a record for future fields (geo-location, device id, etc). */
public record CheckInOutRequest(String remarks) {}
