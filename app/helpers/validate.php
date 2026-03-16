<?php

/**
 * Reusable validation helper functions for server-side input validation.
 */

/**
 * Sanitize a string — trim whitespace and encode HTML entities.
 */
function sanitize($str)
{
    return htmlspecialchars(trim($str), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email format using PHP's built-in filter.
 */
function isValidEmail($email)
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate phone number format (7–15 digits, allows spaces, +, -).
 */
function isValidPhone($phone)
{
    return preg_match('/^[\d\s\+\-]{7,15}$/', $phone);
}

/**
 * Validate date format (YYYY-MM-DD).
 */
function isValidDate($date)
{
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

/**
 * Check if a value is a positive integer (>= 1).
 */
function isPositiveInt($val)
{
    return is_numeric($val) && intval($val) >= 1 && intval($val) == $val;
}

/**
 * Check if a numeric value is within a given range (inclusive).
 */
function isInRange($val, $min, $max)
{
    $num = intval($val);
    return is_numeric($val) && $num >= $min && $num <= $max;
}

/**
 * Check if a string length is within a given range (inclusive).
 */
function isValidLength($str, $min, $max)
{
    $len = mb_strlen($str);
    return $len >= $min && $len <= $max;
}

?>