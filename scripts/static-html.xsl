<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:exsl="http://exslt.org/common"
  xmlns:h="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="exsl h">
  <xsl:import href="../output/default.xsl" />
  <xsl:output method="html" encoding="UTF-8" indent="no"
    doctype-public="" doctype-system="about:legacy-compat" omit-xml-declaration="yes" />

  <xsl:template match="/">
    <xsl:variable name="page"><xsl:apply-imports /></xsl:variable>
    <xsl:apply-templates select="exsl:node-set($page)" mode="html" />
  </xsl:template>

  <!-- HTML serialization must not self-close script, div, or custom elements.
       Keep the upstream DOM and its anchor IDs, but strip XHTML namespaces. -->
  <xsl:template match="h:*|*[namespace-uri()='']" mode="html">
    <xsl:element name="{local-name()}" namespace="">
      <xsl:apply-templates select="@*|node()" mode="html" />
    </xsl:element>
  </xsl:template>
  <xsl:template match="@*|node()" mode="html">
    <xsl:copy><xsl:apply-templates select="@*|node()" mode="html" /></xsl:copy>
  </xsl:template>
</xsl:stylesheet>
